"use client";

import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { offerImage } from "@/config/media";
import { currency, offers, savingsMinor, type OfferId } from "@/config/pricing";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { useCart } from "@/context/CartProvider";
import { useI18n } from "@/context/LocaleProvider";
import { format, formatPrice } from "@/i18n/format";
import { cn } from "@/lib/cn";

export function Offers() {
  const { d, locale } = useI18n();
  const { addLine, selectedOfferId, selectOffer } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(offers.map((offer) => [offer.id, 1])),
  );

  function setQuantity(offerId: OfferId, value: number) {
    setQuantities((current) => ({ ...current, [offerId]: value }));
  }

  return (
    <Section
      id="offers"
      title={d.offers.title}
      description={d.offers.description}
      tone="white"
    >
      <ul className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {offers.map((offer, index) => {
          const item = d.offers.items[offer.i18nKey];
          const bundleItem = "badge" in item ? item : null;
          const image = offerImage[offer.id];
          const selected = selectedOfferId === offer.id;
          const saving = savingsMinor(offer);
          const quantity = quantities[offer.id] ?? 1;
          const headingId = `offer-${offer.id}-name`;

          return (
            <Reveal
              as="li"
              key={offer.id}
              delay={index * 90}
              className={cn(
                "relative flex h-full flex-col rounded-[var(--radius-card)] bg-white p-6 transition-shadow duration-200",
                offer.featured
                  ? "ring-2 ring-violet-600 shadow-[var(--shadow-lift)]"
                  : "ring-1 ring-violet-100 shadow-[var(--shadow-soft)]",
                !offer.inStock && "opacity-90",
              )}
            >
              {bundleItem?.badge ? (
                <Badge
                  tone="accent"
                  className="absolute -top-3 start-6 shadow-[0_8px_16px_-8px_rgba(255,183,3,0.9)]"
                >
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  {bundleItem.badge}
                </Badge>
              ) : null}

              <div className="flex items-start gap-4">
                <Media
                  slot={image}
                  alt={d.media[image.altKey as "offerSingle" | "offerBundle"]}
                  className="w-24 shrink-0 ring-1 ring-violet-100"
                  sizes="96px"
                />
                <div className="min-w-0 flex-1">
                  <h3 id={headingId} className="text-xl font-extrabold">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-500">{item.description}</p>
                  <p className="mt-1 text-sm font-semibold text-violet-600">{item.note}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Price
                  minor={offer.priceMinor}
                  locale={locale}
                  className="text-3xl font-extrabold text-ink-900"
                />
                {offer.compareAtMinor !== null ? (
                  <span className="text-base text-ink-300">
                    {format(d.offers.instead, {
                      amount: formatPrice(offer.compareAtMinor, locale, currency.code),
                    })}
                  </span>
                ) : null}
              </div>

              {offer.units > 1 ? (
                <p className="mt-1 text-sm text-ink-500">
                  {format(d.offers.perPrinter, {
                    price: formatPrice(
                      Math.round(offer.priceMinor / offer.units),
                      locale,
                      currency.code,
                    ),
                  })}
                </p>
              ) : null}

              {saving > 0 ? (
                <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-sunny-100 px-3 py-1 text-sm font-extrabold text-ink-900">
                  <Check className="size-4" aria-hidden="true" />
                  {format(d.offers.saveAmount, {
                    amount: formatPrice(saving, locale, currency.code),
                  })}
                </p>
              ) : null}

              <div className="mt-auto pt-6">
                {offer.inStock ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-ink-700">
                        {d.offers.quantity}
                      </span>
                      <QuantityStepper
                        value={quantity}
                        onChange={(next) => setQuantity(offer.id, next)}
                      />
                    </div>
                    <Button
                      variant={offer.featured ? "accent" : "primary"}
                      size="lg"
                      className="mt-4 w-full"
                      aria-describedby={headingId}
                      onClick={() => {
                        selectOffer(offer.id);
                        addLine(offer.id, quantity);
                      }}
                    >
                      <ShoppingBag className="size-5 shrink-0" aria-hidden="true" />
                      {d.offers.addToCart}
                    </Button>
                    <button
                      type="button"
                      onClick={() => selectOffer(offer.id)}
                      aria-pressed={selected}
                      className={cn(
                        "mt-3 w-full rounded-full py-2 text-sm font-bold transition-colors",
                        selected
                          ? "bg-violet-50 text-violet-700"
                          : "text-ink-500 hover:bg-sand-100",
                      )}
                    >
                      {selected ? d.offers.selected : d.offers.select}
                    </button>
                  </>
                ) : (
                  <div className="rounded-2xl bg-sand-100 p-4 text-center">
                    <p className="font-extrabold text-ink-900">{d.offers.outOfStock}</p>
                    <p className="mt-1 text-sm text-ink-500">{d.offers.outOfStockNote}</p>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
