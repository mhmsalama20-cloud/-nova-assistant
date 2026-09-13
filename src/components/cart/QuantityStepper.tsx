"use client";

import { Minus, Plus } from "lucide-react";

import { maxQuantityPerOffer } from "@/config/pricing";
import { useI18n } from "@/context/LocaleProvider";
import { formatNumber } from "@/i18n/format";
import { cn } from "@/lib/cn";

/**
 * Plus/minus control. The row keeps LTR order in every language so "minus"
 * is always on the left of "plus", which is how steppers are read everywhere,
 * while the number itself is formatted for the active locale.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const { d, locale } = useI18n();
  const buttonSize = size === "sm" ? "size-9" : "size-11";

  return (
    <div
      dir="ltr"
      className={cn(
        "inline-flex items-center rounded-full border-2 border-violet-100 bg-white",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={d.offers.decrease}
        className={cn(
          buttonSize,
          "grid place-items-center rounded-full text-ink-700 transition-colors hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40 disabled:hover:bg-transparent",
        )}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        aria-label={d.offers.quantity}
        className={cn(
          "min-w-9 text-center font-bold tabular-nums",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {formatNumber(value, locale)}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(maxQuantityPerOffer, value + 1))}
        disabled={value >= maxQuantityPerOffer}
        aria-label={d.offers.increase}
        className={cn(
          buttonSize,
          "grid place-items-center rounded-full text-ink-700 transition-colors hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40 disabled:hover:bg-transparent",
        )}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
