"use client";

import { ChevronDown, Clock } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/context/LocaleProvider";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/**
 * The two answers that depend on a physical sample carry a "pending
 * verification" chip until the matching flag in `siteConfig.verifiedClaims`
 * is switched on and the answer text is rewritten with the verified facts.
 */
const questions = [
  { id: "ink", pendingClaim: null },
  { id: "phone", pendingClaim: null },
  { id: "width", pendingClaim: null },
  { id: "box", pendingClaim: "boxContents" },
  { id: "languages", pendingClaim: "multilingualPrinting" },
  { id: "shipping", pendingClaim: null },
] as const;

type QuestionId = (typeof questions)[number]["id"];

export function Faq() {
  const { d, locale } = useI18n();
  const [open, setOpen] = useState<QuestionId | null>("ink");

  function toggle(id: QuestionId) {
    const next = open === id ? null : id;
    setOpen(next);
    if (next) track({ name: "faq_open", payload: { questionId: id, locale } });
  }

  return (
    <Section id="faq" title={d.faq.title} description={d.faq.description} tone="sand">
      <div className="mx-auto max-w-3xl">
        <ul className="space-y-3">
          {questions.map((question, index) => {
            const content = d.faq.items[question.id];
            const isOpen = open === question.id;
            const pending =
              question.pendingClaim !== null &&
              !siteConfig.verifiedClaims[question.pendingClaim];

            return (
              <Reveal
                as="li"
                key={question.id}
                delay={index * 50}
                className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-violet-100"
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => toggle(question.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${question.id}`}
                    id={`faq-button-${question.id}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-start text-lg font-bold transition-colors hover:bg-violet-50/60"
                  >
                    <span>{content.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-5 shrink-0 text-violet-600 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${question.id}`}
                  role="region"
                  aria-labelledby={`faq-button-${question.id}`}
                  hidden={!isOpen}
                  className="px-5 pb-5"
                >
                  {pending ? (
                    <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-sunny-100 px-3 py-1 text-xs font-bold text-ink-900">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {d.faq.pendingBadge}
                    </p>
                  ) : null}
                  <p className="text-ink-700">{content.answer}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
