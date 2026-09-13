import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PolicyPage } from "@/components/sections/PolicyPage";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/metadata";

const ROUTE = "shipping" as const;
const POLICY = "shipping" as const;

/** Config values this page still needs before launch. */
const PENDING_FIELDS = [
  "siteConfig.policies.shippingLeadTimeDays",
  "siteConfig.policies.deliveryTimeDays",
  "siteConfig.policies.shipsToCountries",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return buildPageMetadata({
    locale,
    d,
    route: ROUTE,
    title: `${d.policies[POLICY].title} — ${d.brand.latin}`,
    description: d.policies[POLICY].description,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  return <PolicyPage locale={locale} d={d} policy={POLICY} pendingFields={PENDING_FIELDS} />;
}
