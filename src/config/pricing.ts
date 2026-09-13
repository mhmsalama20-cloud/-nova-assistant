/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CENTRAL PRICING CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Prices live here and nowhere else. No component hard-codes an amount.
 *  Amounts are stored in minor units (cents) to avoid floating point drift.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type OfferId = "single" | "bundle";

export type Offer = {
  id: OfferId;
  /** Number of printers included in one unit of this offer. */
  units: number;
  /** Price of one unit of this offer, in minor units of `currency`. */
  priceMinor: number;
  /** Original price shown struck through. `null` = no comparison price. */
  compareAtMinor: number | null;
  /** Highlighted as the recommended offer. Exactly one should be true. */
  featured: boolean;
  /** Set to false to switch this offer to the out-of-stock state. */
  inStock: boolean;
  /** Translation keys resolved from `locales/<lang>.json` → `offers.items`. */
  i18nKey: "single" | "bundle";
};

export const currency = {
  code: "USD", // MUST EDIT BEFORE LAUNCH if selling in another currency
  /** Used by Intl.NumberFormat; the symbol comes from the locale itself. */
} as const;

export const offers: Offer[] = [
  {
    id: "single",
    units: 1,
    priceMinor: 3990, // $39.90
    compareAtMinor: null,
    featured: false,
    inStock: true,
    i18nKey: "single",
  },
  {
    id: "bundle",
    units: 2,
    priceMinor: 5990, // $59.90
    compareAtMinor: 7980, // 2 × $39.90
    featured: true,
    inStock: true,
    i18nKey: "bundle",
  },
];

export const defaultOfferId: OfferId = "bundle";

/** Maximum quantity of a single offer allowed in the cart. */
export const maxQuantityPerOffer = 10;

export function getOffer(id: OfferId): Offer {
  const offer = offers.find((o) => o.id === id);
  if (!offer) throw new Error(`Unknown offer id: ${id}`);
  return offer;
}

export function findOffer(id: string | null | undefined): Offer | undefined {
  return offers.find((o) => o.id === id);
}

/** Savings of an offer versus its comparison price, in minor units. */
export function savingsMinor(offer: Offer): number {
  if (offer.compareAtMinor === null) return 0;
  return Math.max(0, offer.compareAtMinor - offer.priceMinor);
}

/** Cheapest in-stock price, used by the sticky mobile bar and Product schema. */
export function lowestPriceMinor(): number {
  const available = offers.filter((o) => o.inStock);
  const pool = available.length ? available : offers;
  return Math.min(...pool.map((o) => o.priceMinor));
}

export function anyInStock(): boolean {
  return offers.some((o) => o.inStock);
}
