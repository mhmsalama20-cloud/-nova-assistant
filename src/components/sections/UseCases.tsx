"use client";

import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { media } from "@/config/media";
import { useI18n } from "@/context/LocaleProvider";

export function UseCases() {
  const { d } = useI18n();

  const cards = [
    { key: "kitchen", slot: media.useKitchen, altKey: "useKitchen" },
    { key: "kids", slot: media.useKids, altKey: "useKids" },
    { key: "study", slot: media.useStudy, altKey: "useStudy" },
    { key: "office", slot: media.useOffice, altKey: "useOffice" },
    { key: "packaging", slot: media.usePackaging, altKey: "usePackaging" },
    { key: "gifts", slot: media.useGifts, altKey: "useGifts" },
  ] as const;

  return (
    <Section title={d.useCases.title} description={d.useCases.description} tone="white">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const content = d.useCases.items[card.key];
          return (
            <Reveal
              as="li"
              key={card.key}
              delay={index * 60}
              className="group overflow-hidden rounded-[var(--radius-card)] bg-sand-100 ring-1 ring-violet-100/70"
            >
              <Media
                slot={card.slot}
                alt={d.media[card.altKey]}
                rounded={false}
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                imageClassName="transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
              />
              <div className="p-5">
                <h3 className="text-lg font-extrabold">{content.title}</h3>
                <p className="mt-1.5 text-ink-500">{content.description}</p>
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
