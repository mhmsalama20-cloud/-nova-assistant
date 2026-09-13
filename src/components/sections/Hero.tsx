"use client";

import { PlayCircle, Printer, Smartphone, Ruler } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { media } from "@/config/media";
import { currency, lowestPriceMinor } from "@/config/pricing";
import { useI18n } from "@/context/LocaleProvider";
import { format, formatPrice } from "@/i18n/format";
import { href } from "@/i18n/routing";

export function Hero() {
  const { d, locale } = useI18n();
  const home = href(locale);

  const highlights = [
    { icon: Printer, label: d.hero.highlights.noInk },
    { icon: Smartphone, label: d.hero.highlights.phone },
    { icon: Ruler, label: d.hero.highlights.width },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-violet-50 via-sand-50 to-white">
      {/* Decorative colour wash; hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -end-24 size-96 rounded-full bg-violet-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -start-32 size-96 rounded-full bg-sunny-200/45 blur-3xl"
      />

      <div className="container-page relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-24">
        <Reveal className="text-center lg:text-start">
          <Badge tone="accent" className="mb-5">
            {d.hero.badge}
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]">
            {d.hero.title}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-ink-700 sm:text-xl lg:mx-0">
            {d.hero.description}
          </p>

          <ul className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold text-ink-700 ring-1 ring-violet-100"
              >
                <Icon className="size-4 shrink-0 text-violet-600" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Link href={`${home}#offers`} className={buttonClass("accent", "lg")}>
              {d.hero.primaryCta}
            </Link>
            <Link href={`${home}#how`} className={buttonClass("outline", "lg")}>
              <PlayCircle className="size-5 shrink-0" aria-hidden="true" />
              {d.hero.secondaryCta}
            </Link>
          </div>

          <p className="mt-5 text-sm font-semibold text-ink-500">
            {format(d.hero.priceFrom, {
              price: formatPrice(lowestPriceMinor(), locale, currency.code),
            })}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
            <Media
              slot={media.hero}
              alt={d.media.hero}
              priority
              sizes="(max-width: 1024px) 92vw, 44vw"
              className="shadow-[var(--shadow-lift)] ring-1 ring-violet-100"
            />
            <div className="absolute -bottom-4 start-4 rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)] ring-1 ring-violet-100">
              <p className="text-xs font-bold text-ink-500">{d.brand.productTagline}</p>
              <p className="text-sm font-extrabold text-ink-900">{d.brand.productName}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
