export type TrustTier = "verified" | "likely_match" | "unverified";

export function TrustBadge({ tier }: { tier: TrustTier }) {
  const cfg =
    tier === "verified"
      ? {
          label: "Verified",
          cls: "border-emerald-500/40 bg-emerald-500/[0.1] text-emerald-300/95",
        }
      : tier === "likely_match"
        ? {
            label: "Likely match",
            cls: "border-amber-500/40 bg-amber-500/[0.12] text-amber-200/95",
          }
        : {
            label: "Unverified",
            cls: "border-zinc-600/50 bg-zinc-800/50 text-zinc-400",
          };
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
