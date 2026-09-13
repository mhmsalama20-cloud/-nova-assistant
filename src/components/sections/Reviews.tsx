"use client";

import { BadgeCheck, Star } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { showSampleContent } from "@/config/site";
import { useI18n } from "@/context/LocaleProvider";
import { format, formatNumber } from "@/i18n/format";
import { realReviews, sampleReviews, type Review } from "@/data/reviews";
import { cn } from "@/lib/cn";

/**
 * Renders real reviews when there are any. Otherwise it renders the sample
 * cards, clearly marked, and only in a development build — so a published
 * store with no reviews yet simply omits the section rather than showing
 * invented praise.
 */
export function Reviews() {
  const { d, locale } = useI18n();

  const usingSamples = realReviews.length === 0;
  const reviews: Review[] = usingSamples ? sampleReviews : realReviews;

  if (usingSamples && !showSampleContent) return null;

  return (
    <Section
      title={d.reviews.title}
      description={d.reviews.description}
      tone="white"
    >
      {usingSamples ? (
        <Reveal className="mx-auto mb-8 max-w-2xl rounded-2xl border-2 border-dashed border-sunny-500 bg-sunny-50 p-4 text-start text-sm text-ink-700">
          <p className="font-bold text-ink-900">{d.reviews.sampleBadge}</p>
          <p className="mt-1">{d.reviews.sampleNotice}</p>
        </Reveal>
      ) : null}

      <ul className="grid gap-5 md:grid-cols-3">
        {reviews.map((review, index) => (
          <Reveal
            as="li"
            key={review.id}
            delay={index * 70}
            className={cn(
              "flex h-full flex-col rounded-[var(--radius-card)] bg-sand-100 p-6",
              usingSamples ? "ring-2 ring-dashed ring-sunny-400" : "ring-1 ring-violet-100",
            )}
          >
            <div
              className="flex items-center gap-0.5"
              role="img"
              aria-label={format(d.reviews.ratingLabel, {
                rating: formatNumber(review.rating, locale),
              })}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  aria-hidden="true"
                  className={cn(
                    "size-4",
                    value <= review.rating
                      ? "fill-sunny-500 text-sunny-500"
                      : "fill-transparent text-ink-300",
                  )}
                />
              ))}
            </div>

            <p className="mt-4 flex-1 text-ink-700">
              {review.body[locale] ?? review.body[review.sourceLocale]}
            </p>

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-violet-100 pt-4">
              <span className="font-bold">{review.author}</span>
              {review.verifiedPurchase ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                  {d.reviews.verifiedBuyer}
                </span>
              ) : null}
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
