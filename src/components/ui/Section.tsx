import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  /** Page ground for this band. */
  tone?: "white" | "sand" | "violet";
  className?: string;
  align?: "start" | "center";
};

const tones = {
  white: "bg-white",
  sand: "bg-sand-100",
  violet: "bg-violet-900 text-white",
} as const;

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  tone = "white",
  className,
  align = "center",
}: SectionProps) {
  const onViolet = tone === "violet";

  return (
    <section
      id={id}
      className={cn("scroll-mt-28 py-16 sm:py-20 lg:py-28", tones[tone], className)}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="container-page">
        <Reveal
          className={cn(
            "mx-auto mb-10 max-w-2xl sm:mb-14",
            align === "center" ? "text-center" : "text-start",
          )}
        >
          {eyebrow ? (
            <p
              className={cn(
                "mb-3 text-sm font-bold tracking-wide uppercase",
                onViolet ? "text-sunny-300" : "text-violet-600",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={id ? `${id}-title` : undefined}
            className="text-3xl font-extrabold sm:text-4xl lg:text-[2.75rem]"
          >
            {title}
          </h2>
          {description ? (
            <p className={cn("mt-4 text-lg", onViolet ? "text-violet-100" : "text-ink-500")}>
              {description}
            </p>
          ) : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
