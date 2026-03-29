import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/40",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-600/20 text-violet-200",
        secondary: "border-zinc-700 bg-zinc-900 text-zinc-300",
        outline: "border-zinc-600 text-zinc-300",
        success: "border-emerald-500/40 bg-emerald-950/50 text-emerald-300",
        warning: "border-amber-500/40 bg-amber-950/50 text-amber-200",
        destructive: "border-red-500/40 bg-red-950/50 text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
