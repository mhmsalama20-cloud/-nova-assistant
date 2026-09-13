"use client";

import { useParams } from "next/navigation";

import { defaultLocale, isLocale, localeMeta } from "@/i18n/config";
import ar from "@locales/ar.json";
import en from "@locales/en.json";
import he from "@locales/he.json";
import tr from "@locales/tr.json";

const dictionaries = { ar, en, he, tr };

/** Shown while a locale route is being prepared. */
export default function LocaleLoading() {
  const params = useParams();
  const raw = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const d = dictionaries[locale];

  return (
    <div
      lang={localeMeta[locale].htmlLang}
      dir={localeMeta[locale].dir}
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="size-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"
      />
      <p className="font-semibold text-ink-500">{d.common.loading}</p>
    </div>
  );
}
