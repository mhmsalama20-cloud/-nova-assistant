/**
 * Verifies that every locale file exposes exactly the same key structure as
 * the Arabic reference file — no missing keys, no leftovers.
 *
 *   npm run locales:check
 *
 * TypeScript already catches *missing* keys (see src/i18n/dictionaries.ts);
 * this also catches extras and stale keys, and reports every problem at once.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REFERENCE = "ar";
const LOCALES = ["ar", "en", "tr", "he"];

const load = (locale) =>
  JSON.parse(readFileSync(resolve(root, "locales", `${locale}.json`), "utf8"));

function flatten(value, prefix = "") {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [prefix.slice(0, -1)];
  }
  return Object.entries(value).flatMap(([key, child]) => flatten(child, `${prefix}${key}.`));
}

const reference = flatten(load(REFERENCE));
let failed = false;

for (const locale of LOCALES) {
  const keys = flatten(load(locale));
  const missing = reference.filter((key) => !keys.includes(key));
  const extra = keys.filter((key) => !reference.includes(key));
  const empty = (() => {
    const dict = load(locale);
    return reference.filter((key) => {
      const value = key.split(".").reduce((node, part) => node?.[part], dict);
      return typeof value === "string" && value.trim() === "";
    });
  })();

  if (missing.length || extra.length || empty.length) {
    failed = true;
    console.error(`✗ ${locale}.json`);
    for (const key of missing) console.error(`    missing: ${key}`);
    for (const key of extra) console.error(`    extra:   ${key}`);
    for (const key of empty) console.error(`    empty:   ${key}`);
  } else {
    console.log(`✓ ${locale}.json — ${keys.length} keys`);
  }
}

process.exit(failed ? 1 : 0);
