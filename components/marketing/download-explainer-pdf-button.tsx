"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Extra classes for the button element */
  buttonClassName?: string;
  /** Visible label */
  label?: string;
};

const PDF_PATH = "/api/pdf/leadforge-explainer";

export function DownloadExplainerPdfButton({
  className,
  buttonClassName,
  label = "Download PDF Overview",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDownload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(PDF_PATH, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Server returned ${res.status}`);
      }
      const blob = await res.blob();
      if (!blob.size) {
        throw new Error("Empty PDF response");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "LeadForge-Explainer.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[pdf download]", e);
      setError("Download failed. Try the direct link below.");
    } finally {
      setLoading(false);
    }
  }, []);

  const customLook = Boolean(buttonClassName);

  return (
    <div className={cn("flex w-full max-w-md flex-col items-center gap-2 sm:max-w-lg", className)}>
      <Button
        type="button"
        size="lg"
        variant={customLook ? "ghost" : "secondary"}
        className={cn(
          "h-12 min-h-[48px] w-full gap-2 text-base font-semibold sm:w-auto sm:min-w-[280px]",
          customLook
            ? cn(
                "border-0 bg-transparent p-0 shadow-none hover:bg-transparent [&_svg]:size-5",
                buttonClassName,
              )
            : "border-2 border-teal-500/50 bg-slate-900/90 px-8 text-white shadow-lg shadow-teal-950/30 transition hover:border-teal-400/70 hover:bg-slate-800 hover:text-white",
        )}
        disabled={loading}
        onClick={() => void onDownload()}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <FileDown className="size-5 shrink-0" aria-hidden />
        )}
        {label}
      </Button>
      <a
        href={PDF_PATH}
        download="LeadForge-Explainer.pdf"
        className="text-center text-xs text-slate-500 underline-offset-2 hover:text-teal-400/90 hover:underline"
      >
        Direct download link (if the button doesn’t start a download)
      </a>
      {error ? (
        <p className="text-center text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
