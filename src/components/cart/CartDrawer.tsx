"use client";

import { ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Button, buttonClass } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { offerImage } from "@/config/media";
import { currency, getOffer } from "@/config/pricing";
import { useCart } from "@/context/CartProvider";
import { useI18n } from "@/context/LocaleProvider";
import { href } from "@/i18n/routing";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type CheckoutState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "not_configured" }
  | { kind: "error" };

/**
 * Side cart. It slides in from the inline-end edge, which is the right in
 * English and Turkish and the left in Arabic and Hebrew, because the panel is
 * positioned with logical properties rather than left/right.
 */
export function CartDrawer() {
  const { d, locale } = useI18n();
  const { lines, isOpen, closeCart, setQuantity, removeLine, subtotalMinor, itemCount } =
    useCart();
  const [checkout, setCheckout] = useState<CheckoutState>({ kind: "idle" });
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Reset any previous checkout message whenever the cart is reopened.
  useEffect(() => {
    if (isOpen) setCheckout({ kind: "idle" });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Escape closes; Tab is trapped inside the panel while it is open.
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  const startCheckout = useCallback(async () => {
    if (lines.length === 0) return;
    setCheckout({ kind: "loading" });
    track({
      name: "begin_checkout",
      payload: { valueMinor: subtotalMinor, currency: currency.code, itemCount },
    });

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, lines }),
      });
      const data = (await response.json()) as { status?: string; url?: string };

      if (data.status === "redirect" && data.url) {
        window.location.assign(data.url);
        return;
      }
      setCheckout({ kind: data.status === "not_configured" ? "not_configured" : "error" });
    } catch {
      setCheckout({ kind: "error" });
    }
  }, [lines, locale, subtotalMinor, itemCount]);

  return (
    <div
      aria-hidden={!isOpen}
      // `overflow-hidden` clips the panel while it sits off-screen; without it
      // the translated panel widens the page in left-to-right languages.
      className={cn("fixed inset-0 z-50 overflow-hidden", isOpen ? "visible" : "invisible")}
    >
      <div
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-ink-900/45 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={d.cart.title}
        className={cn(
          "absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-white shadow-[var(--shadow-lift)] transition-transform duration-300 ease-out",
          // `rtl:` flips the slide direction along with the anchored edge.
          isOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-violet-100 px-5 py-4">
          <h2 className="text-lg font-extrabold">{d.cart.title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label={d.cart.close}
            className="grid size-11 place-items-center rounded-full text-ink-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-violet-50 text-violet-500">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </span>
            <p className="text-lg font-bold">{d.cart.empty}</p>
            <p className="text-ink-500">{d.cart.emptyHint}</p>
            <Link
              href={`${href(locale)}#offers`}
              onClick={closeCart}
              className={buttonClass("primary", "md", "mt-2")}
            >
              {d.cart.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-violet-50 overflow-y-auto px-5">
              {lines.map((line) => {
                const offer = getOffer(line.offerId);
                const item = d.offers.items[offer.i18nKey];
                const image = offerImage[offer.id];
                return (
                  <li key={line.offerId} className="flex gap-4 py-5">
                    <Image
                      src={image.src}
                      alt={d.media[image.altKey as keyof typeof d.media]}
                      width={88}
                      height={88}
                      className="size-[5.5rem] shrink-0 rounded-2xl bg-violet-50 object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-bold">{item.name}</p>
                          <p className="truncate text-sm text-ink-500">
                            {d.brand.productName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(line.offerId)}
                          aria-label={`${d.cart.remove}: ${item.name}`}
                          className="grid size-9 shrink-0 place-items-center rounded-full text-ink-300 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <QuantityStepper
                          value={line.quantity}
                          size="sm"
                          min={0}
                          onChange={(next) => setQuantity(line.offerId, next)}
                        />
                        <Price
                          minor={offer.priceMinor * line.quantity}
                          locale={locale}
                          className="font-extrabold"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-violet-100 px-5 py-5">
              {checkout.kind === "not_configured" ? (
                <p
                  role="status"
                  className="mb-4 rounded-2xl bg-sunny-50 p-3 text-sm text-ink-700 ring-1 ring-sunny-500/40"
                >
                  <strong className="block font-bold text-ink-900">
                    {d.checkout.notConfiguredTitle}
                  </strong>
                  {d.checkout.notConfiguredBody}
                </p>
              ) : null}
              {checkout.kind === "error" ? (
                <p
                  role="alert"
                  className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200"
                >
                  <strong className="block font-bold">{d.checkout.errorTitle}</strong>
                  {d.checkout.errorBody}
                </p>
              ) : null}

              <div className="mb-1 flex items-center justify-between text-lg font-extrabold">
                <span>{d.cart.subtotal}</span>
                <Price minor={subtotalMinor} locale={locale} />
              </div>
              <p className="mb-4 text-sm text-ink-500">{d.cart.shippingNote}</p>

              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={startCheckout}
                disabled={checkout.kind === "loading"}
              >
                {checkout.kind === "loading" ? d.checkout.preparing : d.cart.checkout}
              </Button>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full text-sm font-bold text-violet-700 underline underline-offset-4"
              >
                {d.cart.continueShopping}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
