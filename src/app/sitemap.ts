import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { localeMeta, locales } from "@/i18n/config";
import { href, routes, type RouteKey } from "@/i18n/routing";

/** Every page in every language, each entry carrying its hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const routeKeys = Object.keys(routes) as RouteKey[];

  return locales.flatMap((locale) =>
    routeKeys.map((route) => ({
      url: `${siteConfig.url}${href(locale, route)}`,
      lastModified: new Date(),
      changeFrequency: route === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "home" ? 1 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          locales.map((code) => [
            localeMeta[code].htmlLang,
            `${siteConfig.url}${href(code, route)}`,
          ]),
        ),
      },
    })),
  );
}
