import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "accent" | "violet" | "neutral" | "warning";

const tones: Record<Tone, string> = {
  accent: "bg-sunny-500 text-ink-900",
  violet: "bg-violet-100 text-violet-700",
  neutral: "bg-white/90 text-ink-700 ring-1 ring-ink-900/10",
  warning: "bg-sunny-100 text-ink-900 ring-1 ring-sunny-500/50",
};

export function Badge({
  children,
  tone = "violet",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold sm:text-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
