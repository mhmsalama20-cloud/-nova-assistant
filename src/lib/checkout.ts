/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CHECKOUT LAYER (pluggable)
 * ─────────────────────────────────────────────────────────────────────────────
 *  No payment is processed here and there is deliberately no fake payment
 *  form anywhere in the store. This module defines the contract; you plug a
 *  real provider in behind it.
 *
 *  Wiring a provider:
 *    1. Set CHECKOUT_PROVIDER in `.env.local` (stripe | shopify | custom).
 *    2. Add that provider's secrets as environment variables — never in code.
 *    3. Implement the matching branch in `createCheckoutSession` below.
 *
 *  Until then the API route answers `not_configured` and the cart shows a
 *  clear, translated message.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { currency, findOffer, maxQuantityPerOffer } from "@/config/pricing";

export type CheckoutProviderName = "none" | "stripe" | "shopify" | "custom";

export type CheckoutLineInput = {
  offerId: string;
  quantity: number;
};

export type CheckoutRequest = {
  lines: CheckoutLineInput[];
  locale: string;
};

export type CheckoutResult =
  | { status: "redirect"; url: string }
  | { status: "not_configured" }
  | { status: "invalid"; reason: string }
  | { status: "error"; reason: string };

export function getCheckoutProvider(): CheckoutProviderName {
  const raw = (process.env.CHECKOUT_PROVIDER || "none").toLowerCase();
  if (raw === "stripe" || raw === "shopify" || raw === "custom") return raw;
  return "none";
}

/**
 * Re-prices the cart on the server from `src/config/pricing.ts`.
 * Client-submitted prices are never trusted.
 */
export function priceCart(lines: CheckoutLineInput[]) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false as const, reason: "empty_cart" };
  }

  let totalMinor = 0;
  let itemCount = 0;
  const priced = [];

  for (const line of lines) {
    const offer = findOffer(line.offerId);
    if (!offer) return { ok: false as const, reason: `unknown_offer:${line.offerId}` };
    if (!offer.inStock) return { ok: false as const, reason: `out_of_stock:${offer.id}` };

    const quantity = Number(line.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantityPerOffer) {
      return { ok: false as const, reason: `invalid_quantity:${offer.id}` };
    }

    totalMinor += offer.priceMinor * quantity;
    itemCount += quantity;
    priced.push({ offer, quantity, lineTotalMinor: offer.priceMinor * quantity });
  }

  return { ok: true as const, priced, totalMinor, itemCount, currency: currency.code };
}

export async function createCheckoutSession(
  request: CheckoutRequest,
): Promise<CheckoutResult> {
  const priced = priceCart(request.lines);
  if (!priced.ok) return { status: "invalid", reason: priced.reason };

  switch (getCheckoutProvider()) {
    case "stripe":
      /**
       * Example wiring — uncomment after `npm i stripe` and after setting
       * STRIPE_SECRET_KEY plus a price id per offer in the environment:
       *
       *   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
       *   const session = await stripe.checkout.sessions.create({
       *     mode: "payment",
       *     line_items: priced.priced.map((line) => ({
       *       price: process.env[`STRIPE_PRICE_${line.offer.id.toUpperCase()}`]!,
       *       quantity: line.quantity,
       *     })),
       *     locale: request.locale as Stripe.Checkout.SessionCreateParams.Locale,
       *     success_url: `${siteConfig.url}/${request.locale}?checkout=success`,
       *     cancel_url: `${siteConfig.url}/${request.locale}?checkout=cancelled`,
       *   });
       *   return { status: "redirect", url: session.url! };
       */
      return { status: "not_configured" };

    case "shopify":
      /**
       * Example wiring — build a Storefront API cart and redirect to
       * `cart.checkoutUrl`, using SHOPIFY_STORE_DOMAIN and
       * SHOPIFY_STOREFRONT_ACCESS_TOKEN from the environment, plus a
       * Shopify variant id per offer.
       */
      return { status: "not_configured" };

    case "custom": {
      /**
       * Local/regional payment providers: post `priced` to your own endpoint
       * and return the hosted payment page it responds with.
       */
      const endpoint = process.env.CUSTOM_CHECKOUT_ENDPOINT;
      if (!endpoint) return { status: "not_configured" };
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(process.env.CUSTOM_CHECKOUT_API_KEY
              ? { authorization: `Bearer ${process.env.CUSTOM_CHECKOUT_API_KEY}` }
              : {}),
          },
          body: JSON.stringify({
            currency: priced.currency,
            totalMinor: priced.totalMinor,
            locale: request.locale,
            lines: priced.priced.map((line) => ({
              offerId: line.offer.id,
              quantity: line.quantity,
              unitPriceMinor: line.offer.priceMinor,
            })),
          }),
        });
        if (!response.ok) return { status: "error", reason: `provider_status_${response.status}` };
        const data = (await response.json()) as { url?: string };
        if (!data.url) return { status: "error", reason: "provider_missing_url" };
        return { status: "redirect", url: data.url };
      } catch {
        return { status: "error", reason: "provider_unreachable" };
      }
    }

    case "none":
    default:
      return { status: "not_configured" };
  }
}
