/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CENTRAL BUSINESS CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every value tagged `MUST EDIT BEFORE LAUNCH` needs real business data.
 *  Nothing here is invented: unset values are intentionally empty strings and
 *  the UI shows a neutral "not published yet" state instead of a made-up value.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type PendingField = {
  key: string;
  /** Short reminder of what real data has to go in. */
  note: string;
};

export const siteConfig = {
  /** Wordmark, used as-is. Never machine-translated. */
  brandLatin: "Rattebha",
  brandArabic: "رتّبها",

  /** Manufacturer product name. Kept in English in every language. */
  productName: "Q30 Aimo Mini Portable Thermal Label Printer",
  productShortName: "Q30 Aimo Mini",
  productSku: "Q30-AIMO-MINI-15MM",
  labelWidthMm: 15,

  /**
   * Public origin of the deployed store. Used for canonical URLs, hreflang,
   * sitemap and Open Graph. Falls back to localhost during development.
   * MUST EDIT BEFORE LAUNCH — set NEXT_PUBLIC_SITE_URL in the environment.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),

  /**
   * ── MUST EDIT BEFORE LAUNCH ──────────────────────────────────────────────
   * Real contact and legal details. Left empty on purpose: the store renders
   * a "coming soon" note rather than a fabricated address or phone number.
   */
  business: {
    legalName: "" as string, // MUST EDIT BEFORE LAUNCH — registered company name
    email: "" as string, // MUST EDIT BEFORE LAUNCH — customer support inbox
    phone: "" as string, // MUST EDIT BEFORE LAUNCH — support phone (with country code)
    whatsapp: "" as string, // MUST EDIT BEFORE LAUNCH — WhatsApp number or wa.me link
    addressLines: [] as string[], // MUST EDIT BEFORE LAUNCH — postal address
    supportHours: "" as string, // MUST EDIT BEFORE LAUNCH — e.g. "Sun–Thu, 09:00–17:00"
    /** Public social profiles; only non-empty entries are rendered. */
    social: {
      instagram: "" as string, // MUST EDIT BEFORE LAUNCH
      tiktok: "" as string, // MUST EDIT BEFORE LAUNCH
      facebook: "" as string, // MUST EDIT BEFORE LAUNCH
    },
  },

  /**
   * ── MUST EDIT BEFORE LAUNCH ──────────────────────────────────────────────
   * Policy figures. These require real logistics data, so they are `null`
   * until confirmed. Policy pages show a clearly marked placeholder for each.
   */
  policies: {
    shippingLeadTimeDays: null as [number, number] | null, // MUST EDIT BEFORE LAUNCH
    deliveryTimeDays: null as [number, number] | null, // MUST EDIT BEFORE LAUNCH
    returnWindowDays: null as number | null, // MUST EDIT BEFORE LAUNCH
    warrantyMonths: null as number | null, // MUST EDIT BEFORE LAUNCH
    shipsToCountries: [] as string[], // MUST EDIT BEFORE LAUNCH
    lastUpdated: "" as string, // MUST EDIT BEFORE LAUNCH — ISO date, e.g. "2026-01-15"
  },

  /**
   * Product claims that still need to be verified against a physical sample
   * before they can be stated on the live store. The FAQ and the features
   * section render a neutral, non-committal answer while these are false.
   */
  verifiedClaims: {
    /** Has the printer app been tested printing Arabic / Hebrew / Turkish? */
    multilingualPrinting: false as boolean, // MUST EDIT BEFORE LAUNCH — verify with a real sample
    /** Has the supplier's box content been confirmed item by item? */
    boxContents: false as boolean, // MUST EDIT BEFORE LAUNCH — verify with a real sample
  },
} as const;

/**
 * Sample/demo content (example reviews, "needs data" notes) is only shown
 * when this is true. It is off in production unless explicitly enabled,
 * so the published store never displays placeholder social proof.
 */
export const showSampleContent =
  process.env.NEXT_PUBLIC_SHOW_SAMPLE_CONTENT === "true" ||
  process.env.NODE_ENV !== "production";

/** Checklist surfaced in the README and in the dev-only setup banner. */
export const preLaunchChecklist: PendingField[] = [
  { key: "siteConfig.url", note: "Set NEXT_PUBLIC_SITE_URL to the production domain." },
  { key: "siteConfig.business.*", note: "Add real support email, phone and address." },
  { key: "siteConfig.policies.*", note: "Add confirmed shipping, return and warranty terms." },
  { key: "siteConfig.verifiedClaims.*", note: "Test a real Q30 sample, then flip to true and update the FAQ copy." },
  { key: "src/config/pricing.ts", note: "Confirm final prices, currency and stock status." },
  { key: "public/images/*", note: "Replace placeholder artwork with real Q30 photography." },
  { key: "src/data/reviews.ts", note: "Replace sample reviews with verified customer reviews (or leave empty)." },
  { key: ".env.local", note: "Configure the checkout provider and the contact-form transport." },
];

export function hasBusinessContact(): boolean {
  const { email, phone, whatsapp } = siteConfig.business;
  return Boolean(email || phone || whatsapp);
}
