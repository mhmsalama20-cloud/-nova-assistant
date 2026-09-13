"use client";

import {
  Backpack,
  Info,
  PencilRuler,
  Printer,
  Smartphone,
  Timer,
  Home,
} from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { useI18n } from "@/context/LocaleProvider";

export function Features() {
  const { d } = useI18n();

  const items = [
    { key: "noInk", icon: Printer },
    { key: "connection", icon: Smartphone },
    { key: "portable", icon: Backpack },
    { key: "versatile", icon: Home },
    { key: "fast", icon: Timer },
    { key: "width", icon: PencilRuler },
  ] as const;

  return (
    <Section
      id="features"
      title={d.features.title}
      description={d.features.description}
      tone="sand"
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const content = d.features.items[item.key];
          const Icon = item.icon;
          return (
            <Reveal
              as="li"
              key={item.key}
              delay={index * 60}
              className="h-full rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-soft)] ring-1 ring-violet-100/70 transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold">{content.title}</h3>
              <p className="mt-2 text-ink-500">{content.description}</p>
            </Reveal>
          );
        })}
      </ul>

      {/* Honest scope note: this store is multilingual; the printer's own
          language support has not been verified yet. */}
      <Reveal className="mt-8">
        <div className="mx-auto flex max-w-3xl gap-3 rounded-[var(--radius-card)] bg-violet-900 p-5 text-start text-violet-50">
          <Info className="mt-0.5 size-5 shrink-0 text-sunny-400" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            <strong className="block font-bold text-white">
              {d.features.printLanguagesNote.title}
            </strong>
            {d.features.printLanguagesNote.body}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
