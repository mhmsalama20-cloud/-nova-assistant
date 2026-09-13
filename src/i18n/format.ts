import { localeMeta, type Locale } from "./config";

/**
 * Replaces `{name}` placeholders in a translated string.
 *
 *   format(d.cart.itemCount, { count: 3 })  // "3 items in your cart"
 *
 * Unknown placeholders are left untouched so a missing value is visible
 * during development rather than silently rendering an empty string.
 */
export function format(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** Left-to-right and right-to-left marks that Intl embeds in RTL output. */
const DIRECTIONAL_MARKS = /[\u200e\u200f\u061c]/g;
/** First-strong isolate … pop directional isolate. */
const ISOLATE_START = "\u2068";
const ISOLATE_END = "\u2069";

/**
 * Formats a minor-unit amount (cents) as a currency string.
 *
 * Arabic uses the `-u-nu-latn` extension (see `localeMeta`) so prices stay in
 * Western digits, which is what shoppers expect next to a Latin currency code.
 *
 * The result is wrapped in a Unicode isolate and stripped of the directional
 * marks Intl embeds. Without this, dropping a price into an Arabic or Hebrew
 * sentence lets the bidi algorithm pull the currency symbol away from the
 * amount — "US$ 39.90" renders as "$US 39.90". Inside an isolate the whole
 * price is laid out as one unit, in each language's own currency pattern.
 */
export function formatPrice(
  minor: number,
  locale: Locale,
  currencyCode: string,
): string {
  const formatted = new Intl.NumberFormat(localeMeta[locale].formatLocale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);

  return `${ISOLATE_START}${formatted.replace(DIRECTIONAL_MARKS, "")}${ISOLATE_END}`;
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMeta[locale].formatLocale).format(value);
}

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(localeMeta[locale].formatLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
