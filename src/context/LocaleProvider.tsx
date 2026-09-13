"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Direction, Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type LocaleContextValue = {
  locale: Locale;
  dir: Direction;
  d: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Hands the server-resolved locale and dictionary to client components, so no
 * component ever hard-codes a string or re-derives the text direction.
 */
export function LocaleProvider({
  locale,
  dir,
  dictionary,
  children,
}: {
  locale: Locale;
  dir: Direction;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dir, d: dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useI18n must be used inside <LocaleProvider>");
  return context;
}
