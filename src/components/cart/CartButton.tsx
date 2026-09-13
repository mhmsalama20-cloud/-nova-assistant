"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/context/CartProvider";
import { useI18n } from "@/context/LocaleProvider";
import { format, formatNumber } from "@/i18n/format";
import { cn } from "@/lib/cn";

export function CartButton({ className }: { className?: string }) {
  const { itemCount, openCart, hydrated } = useCart();
  const { d, locale } = useI18n();

  return (
    <button
      type="button"
      onClick={openCart}
      // The count is only known after localStorage is read, so the label
      // stays generic until then rather than announcing a wrong number.
      aria-label={
        hydrated && itemCount > 0
          ? format(d.nav.cartWithCount, { count: formatNumber(itemCount, locale) })
          : d.nav.cart
      }
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full border-2 border-violet-100 bg-white text-ink-700 transition-colors hover:border-violet-300 hover:text-violet-700",
        className,
      )}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {hydrated && itemCount > 0 ? (
        <span
          aria-hidden="true"
          className="ltr-num absolute -top-1 -end-1 grid min-w-5 place-items-center rounded-full bg-sunny-500 px-1 text-[0.7rem] font-extrabold text-ink-900"
        >
          {formatNumber(itemCount, locale)}
        </span>
      ) : null}
    </button>
  );
}
