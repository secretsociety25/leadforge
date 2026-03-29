import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import type { Json } from "@/lib/database.types";
import {
  countCampaignsForUser,
  loadUserProfile,
} from "@/lib/data/quotas";
import { effectiveMaxCampaigns } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { searchParms?: Json; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const supabase = await createClient();
  const profile = await loadUserProfile(supabase, user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Profile not ready yet. Try again shortly." },
      { status: 503 },
    );
  }

  const maxCampaigns = effectiveMaxCampaigns(profile.tier);
  const count = await countCampaignsForUser(supabase, user.id);
  if (count >= maxCampaigns) {
    return NextResponse.json(
      {
        error: `Campaign limit reached for ${profile.tier} (${maxCampaigns}).`,
      },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      search_parms: body.searchParms ?? {},
      status: body.status ?? "draft",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
