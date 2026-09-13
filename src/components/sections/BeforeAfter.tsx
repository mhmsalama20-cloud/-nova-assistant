"use client";

import { Check, X } from "lucide-react";

import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { media } from "@/config/media";
import { useI18n } from "@/context/LocaleProvider";

export function BeforeAfter() {
  const { d } = useI18n();

  const panels = [
    {
      key: "before" as const,
      slot: media.before,
      altKey: "before" as const,
      label: d.beforeAfter.beforeLabel,
      text: d.beforeAfter.beforeText,
      icon: X,
      chip: "bg-ink-900/85 text-white",
      ring: "ring-ink-900/10",
    },
    {
      key: "after" as const,
      slot: media.after,
      altKey: "after" as const,
      label: d.beforeAfter.afterLabel,
      text: d.beforeAfter.afterText,
      icon: Check,
      chip: "bg-sunny-500 text-ink-900",
      ring: "ring-violet-200",
    },
  ];

  return (
    <Section
      title={d.beforeAfter.title}
      description={d.beforeAfter.description}
      tone="sand"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {panels.map((panel, index) => {
          const Icon = panel.icon;
          return (
            <Reveal
              key={panel.key}
              delay={index * 100}
              className={`overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ${panel.ring}`}
            >
              <div className="relative">
                <Media
                  slot={panel.slot}
                  alt={d.media[panel.altKey]}
                  rounded={false}
                  sizes="(max-width: 768px) 92vw, 46vw"
                  imageClassName={panel.key === "before" ? "grayscale-[35%]" : undefined}
                />
                <span
                  className={`absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold ${panel.chip}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {panel.label}
                </span>
              </div>
              <p className="p-6 text-lg text-ink-700">{panel.text}</p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
