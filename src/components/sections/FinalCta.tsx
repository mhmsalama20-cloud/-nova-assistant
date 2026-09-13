"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/context/LocaleProvider";
import { href } from "@/i18n/routing";

export function FinalCta() {
  const { d, locale, dir } = useI18n();
  // The arrow points the way the reader is going, so it flips with the text.
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-page">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-violet-900 px-6 py-14 text-center text-white sm:px-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -end-16 size-72 rounded-full bg-violet-600/60 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -start-20 size-72 rounded-full bg-sunny-500/25 blur-3xl"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold sm:text-4xl">{d.finalCta.title}</h2>
            <p className="mt-4 text-lg text-violet-100">{d.finalCta.description}</p>
            <Link
              href={`${href(locale)}#offers`}
              className={buttonClass("accent", "lg", "mt-8")}
            >
              {d.finalCta.cta}
              <Arrow className="size-5 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
