import { currency } from "@/config/pricing";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/i18n/format";
import { cn } from "@/lib/cn";

/**
 * Prices always render left-to-right, even inside Arabic or Hebrew text, so
 * the amount and the currency symbol never swap places.
 */
export function Price({
  minor,
  locale,
  className,
  strike = false,
}: {
  minor: number;
  locale: Locale;
  className?: string;
  strike?: boolean;
}) {
  const formatted = formatPrice(minor, locale, currency.code);
  return (
    <span className={cn("ltr-num", strike && "line-through opacity-60", className)}>
      {formatted}
    </span>
  );
}
