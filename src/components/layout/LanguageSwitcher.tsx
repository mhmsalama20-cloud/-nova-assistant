"use client";

import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  locales,
  localeMeta,
  type Locale,
} from "@/i18n/config";
import { withLocale } from "@/i18n/routing";
import { useI18n } from "@/context/LocaleProvider";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/**
 * Language menu. Each language is listed in its own script and its own
 * direction. Switching navigates to the same page under the new locale
 * prefix, which re-renders `<html lang dir>` on the server; the cart lives in
 * localStorage and is untouched by the change.
 */
export function LanguageSwitcher({
  variant = "header",
  className,
}: {
  variant?: "header" | "footer";
  className?: string;
}) {
  const { locale, d } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) close();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        containerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  function change(next: Locale) {
    close();
    if (next === locale) return;

    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
    track({ name: "language_change", payload: { from: locale, to: next } });
    router.push(withLocale(pathname, next));
    router.refresh();
  }

  if (variant === "footer") {
    return (
      <ul className={cn("flex flex-wrap gap-2", className)}>
        {locales.map((code) => {
          const active = code === locale;
          return (
            <li key={code}>
              <button
                type="button"
                lang={localeMeta[code].htmlLang}
                dir={localeMeta[code].dir}
                onClick={() => change(code)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-violet-600 text-white"
                    : "bg-white/10 text-violet-50 hover:bg-white/20",
                )}
              >
                {localeMeta[code].nativeName}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={`${d.nav.changeLanguage} — ${d.nav.currentLanguage}: ${localeMeta[locale].nativeName}`}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-violet-100 bg-white px-3 text-sm font-bold text-ink-700 transition-colors hover:border-violet-300 hover:text-violet-700"
      >
        <Globe className="size-4 shrink-0" aria-hidden="true" />
        <span lang={localeMeta[locale].htmlLang}>{localeMeta[locale].nativeName}</span>
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={d.nav.language}
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 min-w-44 overflow-hidden rounded-2xl border border-violet-100 bg-white p-1.5 shadow-[var(--shadow-lift)]"
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={localeMeta[code].htmlLang}
                  dir={localeMeta[code].dir}
                  onClick={() => change(code)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-start text-sm font-semibold transition-colors",
                    active
                      ? "bg-violet-50 text-violet-700"
                      : "text-ink-700 hover:bg-sand-100",
                  )}
                >
                  <span>{localeMeta[code].nativeName}</span>
                  {active ? (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
