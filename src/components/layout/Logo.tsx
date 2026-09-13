import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * The brand mark: a label peeling off a card. The wordmark is never
 * translated — Arabic shoppers see رتّبها, everyone else sees Rattebha, and
 * the other script stays alongside as a subtitle.
 */
export function Logo({
  locale,
  arabicName,
  latinName,
  tagline,
  homeLabel,
  className,
  compact = false,
}: {
  locale: Locale;
  arabicName: string;
  latinName: string;
  tagline: string;
  homeLabel: string;
  className?: string;
  compact?: boolean;
}) {
  const primary = locale === "ar" ? arabicName : latinName;
  const secondary = locale === "ar" ? latinName : arabicName;

  return (
    <Link
      href={href(locale)}
      aria-label={`${latinName} — ${homeLabel}`}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl outline-offset-4",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-[0_8px_18px_-10px_rgba(109,40,217,0.9)] transition-transform duration-200 group-hover:-rotate-6"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="12" rx="3" fill="currentColor" opacity="0.28" />
          <rect x="5.5" y="11" width="13" height="9" rx="2" fill="white" />
          <rect x="8" y="14" width="8" height="1.6" rx="0.8" fill="#1B1033" />
          <rect x="8" y="17" width="5" height="1.6" rx="0.8" fill="#1B1033" opacity="0.45" />
          <circle cx="17.5" cy="7.5" r="1.6" fill="#FFB703" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-tight text-ink-900">{primary}</span>
        {compact ? null : (
          <span className="mt-1 text-[0.7rem] font-semibold text-ink-300">
            {secondary} · {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
