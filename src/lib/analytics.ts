/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ANALYTICS EVENT LAYER
 * ─────────────────────────────────────────────────────────────────────────────
 *  Structured, typed events with no third-party tracker attached. Nothing
 *  leaves the browser until you plug in a sink, and a sink that needs cookie
 *  consent must be gated behind consent before it is registered.
 *
 *  To connect a provider (from a client component, once consent is given):
 *
 *      import { registerAnalyticsSink } from "@/lib/analytics";
 *      registerAnalyticsSink((event) => myProvider.track(event.name, event.payload));
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Locale } from "@/i18n/config";
import type { OfferId } from "@/config/pricing";

export type AnalyticsEvent =
  | { name: "language_change"; payload: { from: Locale; to: Locale } }
  | { name: "product_view"; payload: { sku: string; locale: Locale } }
  | { name: "offer_select"; payload: { offerId: OfferId; priceMinor: number; currency: string } }
  | {
      name: "add_to_cart";
      payload: { offerId: OfferId; quantity: number; valueMinor: number; currency: string };
    }
  | { name: "begin_checkout"; payload: { valueMinor: number; currency: string; itemCount: number } }
  | { name: "faq_open"; payload: { questionId: string; locale: Locale } };

export type AnalyticsEventName = AnalyticsEvent["name"];

export type AnalyticsSink = (event: AnalyticsEvent & { at: number }) => void;

const sinks = new Set<AnalyticsSink>();

/** Registers a sink. Returns an unsubscribe function. */
export function registerAnalyticsSink(sink: AnalyticsSink): () => void {
  sinks.add(sink);
  return () => sinks.delete(sink);
}

/** Emits a structured event to every registered sink. */
export function track(event: AnalyticsEvent): void {
  const enriched = { ...event, at: Date.now() } as AnalyticsEvent & { at: number };

  for (const sink of sinks) {
    try {
      sink(enriched);
    } catch (error) {
      // A broken sink must never break the store.
      if (process.env.NODE_ENV !== "production") {
        console.warn("[analytics] sink threw", error);
      }
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", enriched.name, enriched.payload);
  }
}
