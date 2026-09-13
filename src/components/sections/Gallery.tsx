"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { galleryKeys, media } from "@/config/media";
import { useI18n } from "@/context/LocaleProvider";
import { format, formatNumber } from "@/i18n/format";
import { cn } from "@/lib/cn";

const slides = galleryKeys.map((key) => media[key]);

export function Gallery() {
  const { d, locale, dir } = useI18n();
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback((delta: number) => {
    setActive((current) => (current + delta + slides.length) % slides.length);
  }, []);

  // In RTL the on-screen "previous" arrow points the other way, so the arrow
  // keys are mapped to the visual direction rather than the array order.
  const step = dir === "rtl" ? -1 : 1;

  useEffect(() => {
    if (!zoomed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowRight") go(step);
      if (event.key === "ArrowLeft") go(-step);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [zoomed, go, step]);

  const current = slides[active];
  const currentAlt = d.media[current.altKey as keyof typeof d.media];

  return (
    <Section title={d.gallery.title} description={d.gallery.description} tone="sand">
      <Reveal className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`${d.gallery.zoomIn}: ${currentAlt}`}
          className="group relative block w-full overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-violet-100"
        >
          <Media
            slot={current}
            alt={currentAlt}
            rounded={false}
            sizes="(max-width: 768px) 92vw, 48rem"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-4 end-4 grid size-11 place-items-center rounded-full bg-white/95 text-violet-700 shadow-[var(--shadow-soft)] transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100"
          >
            <ZoomIn className="size-5" />
          </span>
        </button>

        <ul className="mt-4 grid grid-cols-5 gap-2 sm:gap-3">
          {slides.map((slide, index) => (
            <li key={slide.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={format(d.gallery.thumbnailLabel, {
                  index: formatNumber(index + 1, locale),
                })}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "block w-full overflow-hidden rounded-xl bg-white transition-all duration-200",
                  index === active
                    ? "ring-2 ring-violet-600"
                    : "opacity-70 ring-1 ring-violet-100 hover:opacity-100",
                )}
              >
                <Image
                  src={slide.src}
                  alt=""
                  width={slide.width}
                  height={slide.height}
                  sizes="20vw"
                  className="aspect-square h-auto w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      {zoomed ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentAlt}
          className="fixed inset-0 z-60 flex flex-col bg-ink-900/92 p-4 backdrop-blur-sm"
        >
          <div className="flex justify-end">
            <button
              ref={closeRef}
              type="button"
              onClick={() => setZoomed(false)}
              aria-label={d.gallery.zoomOut}
              className="grid size-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => go(-step)}
              aria-label={d.gallery.previous}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>

            <Image
              src={current.src}
              alt={currentAlt}
              width={current.width}
              height={current.height}
              sizes="(max-width: 1024px) 80vw, 60vw"
              className="max-h-[70vh] w-auto rounded-2xl bg-white object-contain"
            />

            <button
              type="button"
              onClick={() => go(step)}
              aria-label={d.gallery.next}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          </div>

          <p className="pb-2 text-center text-sm text-violet-100">{currentAlt}</p>
        </div>
      ) : null}
    </Section>
  );
}
