"use client";

import { ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { anyInStock, getOffer } from "@/config/pricing";
import { useCart } from "@/context/CartProvider";
import { useI18n } from "@/context/LocaleProvider";
import { cn } from "@/lib/cn";

/**
 * Mobile-only buy bar pinned to the bottom of the screen. It shows the price
 * of the currently selected offer and either jumps to the offer cards or
 * opens the cart when there is already something in it.
 *
 * It reserves its own height through `--sticky-bar-height` so the footer is
 * never covered.
 */
export function StickyBuyBar() {
  const { d, locale } = useI18n();
  const { selectedOfferId, itemCount, openCart, hydrated } = useCart();
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  // Appear once the hero has scrolled away, so it never covers the main CTA.
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 520);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const height = visible ? (barRef.current?.offsetHeight ?? 0) : 0;
    document.documentElement.style.setProperty("--sticky-bar-height", `${height}px`);
    return () => {
      document.documentElement.style.setProperty("--sticky-bar-height", "0px");
    };
  }, [visible]);

  if (!anyInStock()) return null;

  const offer = getOffer(selectedOfferId);
  const hasItems = hydrated && itemCount > 0;

  function goToOffers() {
    document.getElementById("offers")?.scrollIntoView({ block: "start" });
  }

  return (
    <div
      ref={barRef}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-violet-100 bg-white/97 backdrop-blur transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="container-page flex items-center justify-between gap-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink-500">{d.stickyBar.from}</p>
          <Price
            minor={offer.priceMinor}
            locale={locale}
            className="text-lg font-extrabold"
          />
        </div>
        <Button
          variant="accent"
          size="md"
          className="shrink-0"
          onClick={hasItems ? openCart : goToOffers}
        >
          <ShoppingBag className="size-5 shrink-0" aria-hidden="true" />
          {hasItems ? d.stickyBar.viewCart : d.stickyBar.cta}
        </Button>
      </div>
    </div>
  );
}
