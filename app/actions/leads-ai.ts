"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/lib/actions/result";
import { requireSessionUser } from "@/lib/auth/session";
import { generateClaudeColdEmail, sleep } from "@/lib/ai/claude-email";
import { getOrCreateCsvCampaignId } from "@/lib/data/csv-campaign";
import {
  countCampaignsForUser,
  countLeadsThisMonthForUser,
  loadUserProfile,
} from "@/lib/data/quotas";
import type { Json } from "@/lib/database.types";
import { effectiveMaxCampaigns, effectiveMonthlyLeadQuota } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

const saveInputSchema = z.object({
  mapping: z.object({
    firstName: z.string().min(1),
    company: z.string().min(1),
    linkedin: z.string().min(1),
    email: z.string().optional(),
  }),
  rows: z.array(z.record(z.string(), z.string())),
});

const MAX_ROWS = 500;
const MAX_BATCH_GENERATE = 80;

/**
 * Persists CSV rows as leads (status `pending`) tied to the user's CSV campaign.
 */
export async function saveMappedLeadsAction(
  input: z.infer<typeof saveInputSchema>,
): Promise<ActionResult<{ imported: number; skipped: number; campaignId: string }>> {
  const parsed = saveInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const user = await requireSessionUser();
  const supabase = await createClient();
  const profile = await loadUserProfile(supabase, user.id);
  if (!profile) {
    return { ok: false, error: "Profile not ready yet." };
  }

  const limit = effectiveMonthlyLeadQuota(profile.tier, profile.monthly_lead_quota_override);
  const used = await countLeadsThisMonthForUser(supabase, user.id);
  const remaining = limit === Number.POSITIVE_INFINITY ? MAX_ROWS : Math.max(0, limit - used);

  if (remaining <= 0) {
    return { ok: false, error: "Monthly lead limit reached for your tier." };
  }

  const maxCampaigns = effectiveMaxCampaigns(profile.tier);
  const campaignCount = await countCampaignsForUser(supabase, user.id);
  const { data: existingCsv } = await supabase
    .from("campaigns")
    .select("id")
    .eq("user_id", user.id)
    .contains("search_parms", { source: "csv_upload" })
    .maybeSingle();
  if (!existingCsv && campaignCount >= maxCampaigns) {
    return {
      ok: false,
      error:
        "Campaign slot limit reached. Remove a campaign or upgrade your plan to enable CSV imports.",
    };
  }

  const { mapping, rows: rawRows } = parsed.data;
  const rows = rawRows.slice(0, MAX_ROWS);

  const campaignRes = await getOrCreateCsvCampaignId(supabase, user.id);
  if (campaignRes.error || !campaignRes.id) {
    return { ok: false, error: campaignRes.error ?? "Could not resolve CSV campaign" };
  }
  const campaignId = campaignRes.id;

  type InsertLead = {
    campaign_id: string;
    name: string;
    first_name: string | null;
    company: string | null;
    linkedin_url: string | null;
    email: string | null;
    target_problem: string | null;
    status: string;
    raw_row: Json;
  };

  const inserts: InsertLead[] = [];
  let skipped = 0;

  for (const row of rows) {
    const first = (row[mapping.firstName] ?? "").trim();
    const company = (row[mapping.company] ?? "").trim();
    const linkedin = (row[mapping.linkedin] ?? "").trim();
    const emailCol = mapping.email ? (row[mapping.email] ?? "").trim() : "";

    if (!first || !company || !linkedin) {
      skipped += 1;
      continue;
    }

    if (inserts.length >= remaining) {
      skipped += 1;
      continue;
    }

    inserts.push({
      campaign_id: campaignId,
      name: first,
      first_name: first,
      company,
      linkedin_url: linkedin.startsWith("http")
        ? linkedin
        : `https://${linkedin.replace(/^\/\//, "")}`,
      email: emailCol || null,
      target_problem: null,
      status: "pending",
      raw_row: row as unknown as Json,
    });
  }

  if (inserts.length === 0) {
    return {
      ok: false,
      error:
        "No valid rows to import — map first name, company, and LinkedIn, and ensure those columns have data.",
    };
  }

  const { error } = await supabase.from("leads").insert(inserts);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/upload");
  revalidatePath("/dashboard");
  return {
    ok: true,
    data: { imported: inserts.length, skipped, campaignId },
  };
}

async function runClaudeForLead(
  supabase: Awaited<ReturnType<typeof createClient>>,
  leadId: string,
): Promise<ActionResult<{ draft: string }>> {
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, first_name, name, company, linkedin_url, email, target_problem")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !lead) {
    return { ok: false, error: error?.message ?? "Lead not found" };
  }

  const firstName = (lead.first_name ?? lead.name ?? "there").trim() || "there";
  const company = (lead.company ?? "").trim() || "your company";
  const linkedinUrl = lead.linkedin_url?.trim() ?? null;
  const email = lead.email?.trim() ?? null;

  await sleep(150);
  const { text } = await generateClaudeColdEmail({
    firstName,
    company,
    linkedinUrl,
    email,
  });

  const { error: upErr } = await supabase
    .from("leads")
    .update({
      ai_email_draft: text,
      status: "generated",
      personalised_pitch: text,
    })
    .eq("id", leadId);

  if (upErr) {
    return { ok: false, error: upErr.message };
  }

  return { ok: true, data: { draft: text } };
}

/**
 * Generates a personalized cold email for one lead (Claude 3.5 Sonnet).
 */
export async function generateFullEmail(
  leadId: string,
): Promise<ActionResult<{ draft: string }>> {
  await requireSessionUser();
  const supabase = await createClient();

  try {
    const r = await runClaudeForLead(supabase, leadId);
    if (!r.ok) return r;
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard");
    return r;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    await supabase.from("leads").update({ status: "error" }).eq("id", leadId);
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard");
    return { ok: false, error: msg };
  }
}

const leadIdsSchema = z.array(z.string().min(1)).max(MAX_BATCH_GENERATE);

/**
 * Batch-generate emails for selected leads (sequential server actions — Alpha).
 */
export async function generateFullEmails(
  leadIds: string[],
): Promise<
  ActionResult<{
    results: { id: string; ok: boolean; draft?: string; error?: string }[];
  }>
> {
  const parsed = leadIdsSchema.safeParse(leadIds);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Select up to ${MAX_BATCH_GENERATE} valid leads.`,
    };
  }
  if (parsed.data.length === 0) {
    return { ok: false, error: "No leads selected." };
  }

  await requireSessionUser();
  const supabase = await createClient();
  const results: { id: string; ok: boolean; draft?: string; error?: string }[] = [];

  for (const id of parsed.data) {
    try {
      const r = await runClaudeForLead(supabase, id);
      if (r.ok) {
        results.push({ id, ok: true, draft: r.data.draft });
      } else {
        results.push({ id, ok: false, error: r.error });
        await supabase.from("leads").update({ status: "error" }).eq("id", id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      results.push({ id, ok: false, error: msg });
      await supabase.from("leads").update({ status: "error" }).eq("id", id);
    }
    await sleep(200);
  }

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { ok: true, data: { results } };
}

/**
 * CSV export: original row data + Final_Email_Draft (ai_email_draft).
 */
export async function exportLeadsCsvAction(): Promise<
  ActionResult<{ csv: string; filename: string }>
> {
  const user = await requireSessionUser();
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("raw_row, ai_email_draft")
    .order("created_at", { ascending: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  const safe = leads ?? [];
  if (safe.length === 0) {
    return { ok: false, error: "No leads to export." };
  }

  const keySet = new Set<string>();
  for (const l of safe) {
    const raw = l.raw_row;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      Object.keys(raw as object).forEach((k) => keySet.add(k));
    }
  }
  const baseKeys = Array.from(keySet).sort();
  const headers = [...baseKeys, "Final_Email_Draft"];

  const esc = (v: string) => {
    if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };

  const lines = [headers.join(",")];
  for (const l of safe) {
    const raw = (l.raw_row && typeof l.raw_row === "object" && !Array.isArray(l.raw_row)
      ? (l.raw_row as Record<string, unknown>)
      : {}) as Record<string, string>;
    const cells = baseKeys.map((k) => esc(String(raw[k] ?? "")));
    cells.push(esc(l.ai_email_draft ?? ""));
    lines.push(cells.join(","));
  }

  const csv = lines.join("\r\n");
  const filename = `leadforge-export-${new Date().toISOString().slice(0, 10)}.csv`;
  return { ok: true, data: { csv, filename } };
}
