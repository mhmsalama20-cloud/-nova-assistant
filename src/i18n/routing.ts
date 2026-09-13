import { locales, type Locale } from "./config";

/** Route segments shared by every language. Slugs stay in English. */
export const routes = {
  home: "",
  contact: "contact",
  shipping: "shipping-policy",
  returns: "returns-policy",
  privacy: "privacy-policy",
  terms: "terms",
} as const;

export type RouteKey = keyof typeof routes;

/** Builds a locale-prefixed path, e.g. `href("he", "privacy")` → `/he/privacy-policy`. */
export function href(locale: Locale, route: RouteKey = "home"): string {
  const segment = routes[route];
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

/**
 * Swaps the locale segment of the current pathname, keeping the rest of the
 * path intact so a language switch never throws the visitor back to the home
 * page.
 */
export function withLocale(pathname: string, locale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && (locales as readonly string[]).includes(parts[0])) {
    parts[0] = locale;
  } else {
    parts.unshift(locale);
  }
  return `/${parts.join("/")}`;
}

/** Path without its locale prefix, used to build hreflang alternates. */
export function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && (locales as readonly string[]).includes(parts[0])) {
    parts.shift();
  }
  return parts.length ? `/${parts.join("/")}` : "";
}
