"use client";

import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { media } from "@/config/media";
import { useI18n } from "@/context/LocaleProvider";
import { format, formatNumber } from "@/i18n/format";

export function HowItWorks() {
  const { d, locale } = useI18n();

  const steps = [
    { key: "one", slot: media.step1, altKey: "step1" },
    { key: "two", slot: media.step2, altKey: "step2" },
    { key: "three", slot: media.step3, altKey: "step3" },
  ] as const;

  return (
    <Section id="how" title={d.how.title} description={d.how.description} tone="white">
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {steps.map((step, index) => {
          const content = d.how.steps[step.key];
          return (
            <Reveal as="li" key={step.key} delay={index * 90} className="flex flex-col">
              <div className="relative">
                <Media
                  slot={step.slot}
                  alt={d.media[step.altKey]}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                  className="ring-1 ring-violet-100"
                />
                <span
                  className="ltr-num absolute -bottom-4 start-5 grid size-11 place-items-center rounded-full bg-violet-600 text-lg font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(109,40,217,0.9)]"
                  aria-hidden="true"
                >
                  {formatNumber(index + 1, locale)}
                </span>
              </div>
              <div className="mt-7 px-1">
                <p className="text-sm font-bold text-violet-600">
                  {format(d.how.stepLabel, { number: formatNumber(index + 1, locale) })}
                </p>
                <h3 className="mt-1 text-xl font-extrabold">{content.title}</h3>
                <p className="mt-2 text-ink-500">{content.description}</p>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </Section>
  );
}
