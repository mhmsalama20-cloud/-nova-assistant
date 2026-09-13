"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { defaultLocale, isLocale, localeMeta } from "@/i18n/config";
import ar from "@locales/ar.json";
import en from "@locales/en.json";
import he from "@locales/he.json";
import tr from "@locales/tr.json";

/**
 * Error boundary for the whole locale segment. It is a client component, so
 * it reads the language from the route params and pulls the same strings the
 * rest of the store uses.
 */
const dictionaries = { ar, en, he, tr };

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const raw = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const d = dictionaries[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      lang={localeMeta[locale].htmlLang}
      dir={localeMeta[locale].dir}
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"
    >
      <h1 className="text-2xl font-extrabold">{d.common.errorTitle}</h1>
      <p className="mt-2 max-w-md text-ink-500">{d.common.errorBody}</p>
      <Button variant="primary" size="md" className="mt-6" onClick={reset}>
        {d.common.retry}
      </Button>
    </div>
  );
}
