import { NextResponse, type NextRequest } from "next/server";

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
  matchLocale,
  parseAcceptLanguage,
} from "@/i18n/config";

/**
 * Every page lives under a locale prefix (`/ar`, `/en`, `/tr`, `/he`) so each
 * language is separately indexable. Requests without a prefix are redirected
 * to the visitor's language: the one they picked before (cookie), otherwise
 * their browser's, otherwise Arabic.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (isLocale(first)) {
    const response = NextResponse.next();
    // Remember the language the visitor is actually browsing in.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== first) {
      response.cookies.set(LOCALE_COOKIE, first, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
      });
    }
    return response;
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale(parseAcceptLanguage(request.headers.get("accept-language")));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  /**
   * Runs on page routes only: API routes, Next internals, the sitemap and
   * anything with a file extension are excluded.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|images/|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.[\\w]+$).*)",
  ],
};
