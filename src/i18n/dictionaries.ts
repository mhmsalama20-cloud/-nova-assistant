import "server-only";

import ar from "@locales/ar.json";
import en from "@locales/en.json";
import he from "@locales/he.json";
import tr from "@locales/tr.json";

import type { Locale } from "./config";

/**
 * The Arabic file is the reference shape: every other locale must expose
 * exactly the same keys, which `npm run typecheck` enforces below.
 */
export type Dictionary = typeof ar;

const dictionaries: Record<Locale, Dictionary> = {
  ar,
  en,
  he,
  tr,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
