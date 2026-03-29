"use client";

import Papa from "papaparse";
import { FileUp, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

import { saveMappedLeadsAction } from "@/app/actions/leads-ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const ROLE_FIELDS = [
  { key: "firstName" as const, label: "First name", required: true },
  { key: "company" as const, label: "Company", required: true },
  { key: "linkedin" as const, label: "LinkedIn URL", required: true },
  { key: "email" as const, label: "Email (optional)", required: false },
] as const;

type MappingState = Record<(typeof ROLE_FIELDS)[number]["key"], string | undefined>;

type Props = {
  /** When true, hides large page title — for embedding on the main dashboard. */
  embedded?: boolean;
};

export function CsvUploadFlow({ embedded = false }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"drop" | "map" | "done">("drop");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Partial<MappingState>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  const parseFile = useCallback((file: File) => {
    setError(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const fields = res.meta.fields?.filter(Boolean) as string[];
        if (!fields?.length) {
          setError("Could not read column headers from this CSV.");
          return;
        }
        const data = res.data.filter((r) => Object.values(r).some((v) => String(v).trim()));
        if (data.length === 0) {
          setError("No data rows found.");
          return;
        }
        setHeaders(fields);
        setRows(data);
        const guess: Partial<MappingState> = {};
        for (const f of fields) {
          if (!guess.firstName && /first|given|fname/i.test(f)) guess.firstName = f;
          if (!guess.company && /company|org|account/i.test(f)) guess.company = f;
          if (!guess.linkedin && /linkedin|li url/i.test(f)) guess.linkedin = f;
          if (!guess.email && (/^email$/i.test(f) || /e-?mail|work email/i.test(f))) guess.email = f;
        }
        setMapping(guess);
        setStep("map");
      },
      error: (err) => setError(err.message),
    });
  }, []);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0];
      if (f) void parseFile(f);
    },
    [parseFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    maxFiles: 1,
    multiple: false,
  });

  const canSave = useMemo(() => {
    return ROLE_FIELDS.filter((r) => r.required).every((r) => mapping[r.key]?.trim());
  }, [mapping]);

  const onSave = useCallback(async () => {
    setError(null);
    if (!canSave) {
      setError("Map all required columns.");
      return;
    }
    setLoading(true);
    try {
      const m = mapping as MappingState;
      const res = await saveMappedLeadsAction({
        mapping: {
          firstName: m.firstName!,
          company: m.company!,
          linkedin: m.linkedin!,
          email: m.email?.trim() || undefined,
        },
        rows,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult({ imported: res.data.imported, skipped: res.data.skipped });
      setStep("done");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [canSave, mapping, rows, router]);

  return (
    <div className={embedded ? "space-y-6" : "mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6"}>
      {!embedded ? (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Upload leads</h1>
          <p className="mt-2 text-zinc-400">
            Drop a CSV. Map columns — we store rows as{" "}
            <Badge variant="secondary">pending</Badge> until you generate emails.
          </p>
          <p className="mt-3 text-xs text-amber-200/80">
            Only upload data you&apos;re allowed to use. Using third-party data may be subject to their
            terms.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-white">Import CSV</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Map to first name, company, LinkedIn — saved as pending until you generate drafts below.
          </p>
        </div>
      )}

      {step === "drop" ? (
        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardTitle className="text-zinc-100">Upload file</CardTitle>
            <CardDescription>CSV with headers. Max {500} rows per batch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
                isDragActive
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-zinc-700 bg-zinc-900/40 hover:border-violet-500/50 hover:bg-zinc-900/60"
              }`}
            >
              <input {...getInputProps()} />
              <FileUp className="mb-3 size-10 text-violet-400" aria-hidden />
              <span className="font-medium text-zinc-200">
                {isDragActive ? "Drop the file here" : "Drag & drop your CSV here"}
              </span>
              <span className="mt-1 text-sm text-zinc-500">or click to browse</span>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === "map" ? (
        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardTitle className="text-zinc-100">Column mapping</CardTitle>
            <CardDescription>
              Match your CSV columns to LeadForge fields. {rows.length} rows loaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {ROLE_FIELDS.map((field) => (
              <div key={field.key} className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-center">
                <Label className="text-zinc-300">
                  {field.label}
                  {field.required ? <span className="text-red-400"> *</span> : null}
                </Label>
                <select
                  className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                  value={mapping[field.key] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [field.key]: e.target.value || undefined }))
                  }
                >
                  <option value="">— Select column —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {error ? (
              <p className="text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" disabled={loading || !canSave} onClick={() => void onSave()}>
                {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
                Save leads
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep("drop")}>
                Start over
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "done" && result ? (
        <Card className="border-emerald-500/30 bg-emerald-950/10">
          <CardHeader>
            <CardTitle className="text-zinc-100">Imported</CardTitle>
            <CardDescription>
              {result.imported} leads saved as <Badge variant="secondary">pending</Badge>.{" "}
              {result.skipped > 0 ? `${result.skipped} rows skipped.` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                document.getElementById("leadforge-leads")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Generate emails below
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep("drop");
                setHeaders([]);
                setRows([]);
                setMapping({});
                setResult(null);
                setError(null);
              }}
            >
              Upload another
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
