/**
 * Single source of truth for the store's language system.
 * Adding a language = add it here + add `locales/<code>.json`.
 */

export const locales = ["ar", "en", "tr", "he"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export type Direction = "rtl" | "ltr";

type LocaleMeta = {
  /** Name of the language written in that language itself. */
  nativeName: string;
  dir: Direction;
  /** BCP-47 tag used for <html lang> and for hreflang. */
  htmlLang: string;
  /**
   * Locale tag used for Intl number/currency formatting.
   * `-u-nu-latn` keeps Western digits in Arabic so prices stay readable
   * next to the Latin currency code.
   */
  formatLocale: string;
  /** Used by Open Graph `og:locale`. */
  ogLocale: string;
};

export const localeMeta: Record<Locale, LocaleMeta> = {
  ar: {
    nativeName: "العربية",
    dir: "rtl",
    htmlLang: "ar",
    formatLocale: "ar-u-nu-latn",
    ogLocale: "ar_AR",
  },
  en: {
    nativeName: "English",
    dir: "ltr",
    htmlLang: "en",
    formatLocale: "en-US",
    ogLocale: "en_US",
  },
  tr: {
    nativeName: "Türkçe",
    dir: "ltr",
    htmlLang: "tr",
    formatLocale: "tr-TR",
    ogLocale: "tr_TR",
  },
  he: {
    nativeName: "עברית",
    dir: "rtl",
    htmlLang: "he",
    formatLocale: "he-IL",
    ogLocale: "he_IL",
  },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): Direction {
  return localeMeta[locale].dir;
}

/** Cookie that remembers the visitor's chosen language across visits. */
export const LOCALE_COOKIE = "rattebha_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Best-effort match of an `Accept-Language` header (or navigator.languages)
 * to one of our locales. Falls back to Arabic, as specified.
 */
export function matchLocale(candidates: readonly string[]): Locale {
  for (const raw of candidates) {
    const tag = raw.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0];
    // `iw` is the legacy code for Hebrew and is still sent by some devices.
    const normalized = base === "iw" ? "he" : base;
    if (isLocale(normalized)) return normalized;
  }
  return defaultLocale;
}

/** Parses an `Accept-Language` header into tags ordered by quality. */
export function parseAcceptLanguage(header: string | null): string[] {
  if (!header) return [];
  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      return { tag: tag.trim(), q: q ? Number.parseFloat(q.slice(2)) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag);
}
