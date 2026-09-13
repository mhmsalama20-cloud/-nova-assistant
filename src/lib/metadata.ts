import type { Metadata } from "next";

import { media } from "@/config/media";
import { currency, lowestPriceMinor, anyInStock } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { localeMeta, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { href, type RouteKey } from "@/i18n/routing";

/**
 * Builds canonical + hreflang alternates for a route in every language, plus
 * the `x-default` entry pointing at the default locale.
 */
export function buildAlternates(locale: Locale, route: RouteKey = "home") {
  const languages: Record<string, string> = {};
  for (const code of locales) {
    languages[localeMeta[code].htmlLang] = `${siteConfig.url}${href(code, route)}`;
  }
  languages["x-default"] = `${siteConfig.url}${href("ar", route)}`;

  return {
    canonical: `${siteConfig.url}${href(locale, route)}`,
    languages,
  };
}

export function buildPageMetadata({
  locale,
  d,
  route = "home",
  title,
  description,
}: {
  locale: Locale;
  d: Dictionary;
  route?: RouteKey;
  title?: string;
  description?: string;
}): Metadata {
  const pageTitle = title ?? d.meta.title;
  const pageDescription = description ?? d.meta.description;
  const url = `${siteConfig.url}${href(locale, route)}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: buildAlternates(locale, route),
    openGraph: {
      type: "website",
      url,
      siteName: d.brand.latin,
      title: pageTitle,
      description: pageDescription,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((code) => code !== locale)
        .map((code) => localeMeta[code].ogLocale),
      images: [
        {
          url: `${siteConfig.url}${media.ogImage.src}`,
          width: media.ogImage.width,
          height: media.ogImage.height,
          alt: d.meta.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [`${siteConfig.url}${media.ogImage.src}`],
    },
  };
}

/**
 * Product structured data.
 *
 * Deliberately omits `aggregateRating` and `review`: there are no verified
 * reviews yet, and publishing invented ones would be false. Availability is
 * read from the pricing config rather than asserted.
 */
export function buildProductJsonLd(locale: Locale, d: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: siteConfig.productName,
    description: d.meta.description,
    sku: siteConfig.productSku,
    image: [`${siteConfig.url}${media.gallery1.src}`, `${siteConfig.url}${media.hero.src}`],
    brand: { "@type": "Brand", name: siteConfig.brandLatin },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}${href(locale)}`,
      priceCurrency: currency.code,
      price: (lowestPriceMinor() / 100).toFixed(2),
      availability: anyInStock()
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

/** FAQ structured data, built from the same strings the page renders. */
export function buildFaqJsonLd(d: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: Object.values(d.faq.items).map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
