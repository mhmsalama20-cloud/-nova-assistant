import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Rubik } from "next/font/google";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site";
import { getDirection, isLocale, locales, localeMeta, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/metadata";

import "../globals.css";

/**
 * Rubik covers Latin, Latin Extended (Turkish) and Hebrew in one modern
 * geometric face; IBM Plex Sans Arabic renders Arabic, where it is the
 * stronger typeface. Both are self-hosted by next/font with a size-adjusted
 * fallback, so no layout shift when they load.
 */
const rubik = Rubik({
  subsets: ["latin", "latin-ext", "hebrew"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  colorScheme: "light",
};

/** Pre-renders one static page per language. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const d = getDictionary(locale);
  return {
    metadataBase: new URL(siteConfig.url),
    applicationName: d.brand.latin,
    ...buildPageMetadata({ locale, d }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const dir = getDirection(typedLocale);

  return (
    <html
      lang={localeMeta[typedLocale].htmlLang}
      dir={dir}
      className={`${rubik.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
