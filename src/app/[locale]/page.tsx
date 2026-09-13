import { notFound } from "next/navigation";

import { StoreShell, TrackProductView } from "@/components/layout/StoreShell";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { FinalCta } from "@/components/sections/FinalCta";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Offers } from "@/components/sections/Offers";
import { Reviews } from "@/components/sections/Reviews";
import { UseCases } from "@/components/sections/UseCases";
import { getDirection, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildFaqJsonLd, buildProductJsonLd } from "@/lib/metadata";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const d = getDictionary(locale);

  return (
    <>
      <script
        type="application/ld+json"
        // Built from the same config and dictionary the page renders, so the
        // markup can never drift from what a shopper sees.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([buildProductJsonLd(locale, d), buildFaqJsonLd(d)]),
        }}
      />
      <StoreShell
        locale={locale}
        dir={getDirection(locale)}
        dictionary={d}
        showStickyBar
      >
        <TrackProductView locale={locale} />
        <Hero />
        <HowItWorks />
        <Features />
        <Gallery />
        <UseCases />
        <Offers />
        <BeforeAfter />
        <Reviews />
        <Faq />
        <FinalCta />
      </StoreShell>
    </>
  );
}
