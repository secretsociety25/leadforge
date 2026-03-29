"use client";

import { Download, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  exportLeadsCsvAction,
  generateFullEmail,
  generateFullEmails,
} from "@/app/actions/leads-ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tables } from "@/lib/database.types";

function statusVariant(s: string): "default" | "secondary" | "success" | "warning" | "destructive" {
  switch (s) {
    case "generated":
      return "success";
    case "ready":
    case "pending":
      return "warning";
    case "error":
      return "destructive";
    default:
      return "secondary";
  }
}

function missingDraft(l: Tables<"leads">): boolean {
  return !(l.ai_email_draft ?? "").trim();
}

type Props = {
  initialLeads: Tables<"leads">[];
  /** Embed on main dashboard — tighter heading + anchor id */
  embedded?: boolean;
};

export function LeadsFactoryClient({ initialLeads, embedded = false }: Props) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const pending = useMemo(() => leads.filter((l) => missingDraft(l)), [leads]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const selectAllPending = useCallback(() => {
    const ids = pending.map((l) => l.id);
    setSelected(new Set(ids));
  }, [pending]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const onGenerateOne = useCallback(
    async (id: string) => {
      setError(null);
      setBusyId(id);
      try {
        const res = await generateFullEmail(id);
        if (!res.ok) {
          setError(res.error);
          setLeads((prev) =>
            prev.map((l) => (l.id === id ? { ...l, status: "error" as const } : l)),
          );
          return;
        }
        setLeads((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  ai_email_draft: res.data.draft,
                  personalised_pitch: res.data.draft,
                  status: "generated",
                }
              : l,
          ),
        );
        setSelected((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
        router.refresh();
      } finally {
        setBusyId(null);
      }
    },
    [router],
  );

  const onGenerateSelected = useCallback(async () => {
    const ids = Array.from(selected).filter((id) => leads.some((l) => l.id === id));
    if (ids.length === 0) {
      setError("Select at least one lead.");
      return;
    }
    setError(null);
    setRunning(true);
    setBusyId(null);
    const res = await generateFullEmails(ids);
    if (!res.ok) {
      setError(res.error);
      setRunning(false);
      return;
    }
    const { results } = res.data;
    for (const r of results) {
      if (r.ok && r.draft) {
        const draft = r.draft;
        setLeads((prev) =>
          prev.map((l) =>
            l.id === r.id
              ? {
                  ...l,
                  ai_email_draft: draft,
                  personalised_pitch: draft,
                  status: "generated",
                }
              : l,
          ),
        );
      } else {
        setLeads((prev) =>
          prev.map((l) => (l.id === r.id ? { ...l, status: "error" as const } : l)),
        );
        if (r.error) setError(r.error);
      }
    }
    clearSelection();
    setRunning(false);
    router.refresh();
  }, [selected, leads, router, clearSelection]);

  const onGenerateAll = useCallback(async () => {
    if (pending.length === 0) return;
    setError(null);
    setRunning(true);
    const ids = pending.map((l) => l.id);
    const res = await generateFullEmails(ids);
    if (!res.ok) {
      setError(res.error);
      setRunning(false);
      return;
    }
    const { results } = res.data;
    for (const r of results) {
      if (r.ok && r.draft) {
        const draft = r.draft;
        setLeads((prev) =>
          prev.map((l) =>
            l.id === r.id
              ? {
                  ...l,
                  ai_email_draft: draft,
                  personalised_pitch: draft,
                  status: "generated",
                }
              : l,
          ),
        );
      } else {
        setLeads((prev) =>
          prev.map((l) => (l.id === r.id ? { ...l, status: "error" as const } : l)),
        );
        if (r.error) setError(r.error);
      }
    }
    setRunning(false);
    router.refresh();
  }, [pending, router]);

  const onExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await exportLeadsCsvAction();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const blob = new Blob([res.data.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, []);

  const wrapId = embedded ? { id: "leadforge-leads" } : {};

  return (
    <div
      className={
        embedded
          ? "mx-auto max-w-6xl space-y-6 pt-4"
          : "mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6"
      }
      {...wrapId}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {embedded ? (
            <h2 className="text-xl font-bold tracking-tight text-white">Lead pipeline</h2>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-white">Lead factory</h1>
          )}
          <p className="mt-2 text-zinc-400">
            Claude 3.5 Sonnet drafts — select rows and generate, or run all pending. Export includes{" "}
            <code className="text-zinc-300">Final_Email_Draft</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!embedded ? (
            <Button variant="secondary" asChild>
              <Link href="/dashboard/upload">Full upload page</Link>
            </Button>
          ) : null}
          <Button variant="outline" disabled={exporting || leads.length === 0} onClick={() => void onExport()}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download className="size-4" />}
            Export CSV
          </Button>
          <Button
            variant="secondary"
            disabled={running || selected.size === 0}
            onClick={() => void onGenerateSelected()}
          >
            {running ? <Loader2 className="animate-spin" /> : <Sparkles className="size-4" />}
            Generate selected ({selected.size})
          </Button>
          <Button disabled={running || pending.length === 0} onClick={() => void onGenerateAll()}>
            {running ? <Loader2 className="animate-spin" /> : <Sparkles className="size-4" />}
            Generate all pending
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          className="text-violet-400 hover:underline disabled:opacity-40"
          disabled={pending.length === 0}
          onClick={selectAllPending}
        >
          Select all pending
        </button>
        <span className="text-zinc-600">·</span>
        <button type="button" className="text-zinc-400 hover:text-zinc-200" onClick={clearSelection}>
          Clear selection
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      {running ? (
        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardContent className="flex items-center gap-3 py-6 text-sm text-zinc-300">
            <Loader2 className="size-5 shrink-0 animate-spin text-violet-400" aria-hidden />
            Generating drafts with Claude…
          </CardContent>
        </Card>
      ) : null}

      {leads.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardContent className="py-12 text-center text-zinc-400">
            No leads yet.{" "}
            {embedded ? (
              <span className="font-medium text-violet-400">Upload a CSV above</span>
            ) : (
              <Link href="/dashboard/upload" className="font-medium text-violet-400 hover:underline">
                Upload a CSV
              </Link>
            )}{" "}
            to get started.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardTitle className="text-zinc-100">Leads</CardTitle>
            <CardDescription>
              {leads.length} total · {pending.length} awaiting draft
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[280px]">AI draft</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  const st = lead.status ?? "pending";
                  const draft = lead.ai_email_draft ?? lead.personalised_pitch ?? "";
                  const canSelect = missingDraft(lead);
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="size-4 rounded border-zinc-600 bg-zinc-900 accent-violet-600"
                          checked={selected.has(lead.id)}
                          disabled={!canSelect || running}
                          onChange={() => toggle(lead.id)}
                          aria-label={`Select ${lead.first_name ?? lead.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {lead.first_name ?? lead.name}
                      </TableCell>
                      <TableCell>{lead.company ?? "—"}</TableCell>
                      <TableCell className="text-zinc-400">{lead.email ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(st)}>{st}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-h-36 max-w-xl overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
                          {draft || (
                            <span className="text-zinc-600">
                              {busyId === lead.id ? "Writing…" : "—"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={running || busyId === lead.id}
                          onClick={() => void onGenerateOne(lead.id)}
                        >
                          {busyId === lead.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Generate"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
