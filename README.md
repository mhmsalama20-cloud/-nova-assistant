# رتّبها — Rattebha

A production-ready one-product store for the **Q30 Aimo Mini Portable Thermal
Label Printer**, a 15 mm thermal label printer that works from a phone with no
ink.

Built with **Next.js 15 (App Router)**, **TypeScript** and **Tailwind CSS v4**,
with a full four-language system: **Arabic (ar), English (en), Turkish (tr),
Hebrew (he)** — Arabic and Hebrew right-to-left, English and Turkish
left-to-right.

> **Brand:** رتّبها — Rattebha  ·  **Tagline:** اطبعها. ألصقها. رتّبها.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in the values you have
npm run dev                    # http://localhost:3000 → redirects to your language
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (32 static pages: 8 routes × 4 languages) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run locales:check` | Verify all four locale files share one key structure |
| `npm run images:placeholders` | Regenerate the placeholder artwork |

---

## Project structure

```
locales/                    ar.json · en.json · tr.json · he.json   ← all copy
src/
  app/
    [locale]/               layout · page · contact · 4 policy pages
                            error.tsx · loading.tsx · not-found.tsx
    api/checkout/route.ts   starts a checkout with the configured provider
    api/contact/route.ts    validates and forwards a contact message
    globals.css             design tokens (colours, fonts, motion)
    sitemap.ts · robots.ts
  middleware.ts             language detection + /<locale> redirect
  config/
    site.ts                 business data — every "MUST EDIT BEFORE LAUNCH" flag
    pricing.ts              prices, currency, stock, offer definitions
    media.ts                image registry (paths, sizes, alt keys)
  i18n/
    config.ts               locales, direction, native names, matching
    dictionaries.ts         typed loader; ar.json is the reference shape
    format.ts               price / number / date formatting, bidi-safe
    routing.ts              locale-prefixed hrefs, locale swapping
  context/
    LocaleProvider.tsx      locale + dictionary for client components
    CartProvider.tsx        cart state, localStorage, analytics
  lib/
    checkout.ts             pluggable payment layer (no fake checkout)
    contact.ts              pluggable email layer + shared validation
    analytics.ts            typed events, no third-party tracker
    metadata.ts             metadata, hreflang, Product & FAQ JSON-LD
  components/
    layout/  ui/  sections/  cart/  contact/
  data/reviews.ts           real reviews (empty) + clearly-marked samples
public/images/              placeholder artwork
```

---

## Common edits

### Change prices, currency or stock

Everything lives in **`src/config/pricing.ts`**. No component hard-codes an
amount; the server re-prices the cart from this file at checkout, so a
client cannot submit its own price.

```ts
export const currency = { code: "USD" };

export const offers: Offer[] = [
  { id: "single", units: 1, priceMinor: 3990, compareAtMinor: null,  featured: false, inStock: true,  i18nKey: "single" },
  { id: "bundle", units: 2, priceMinor: 5990, compareAtMinor: 7980, featured: true,  inStock: true,  i18nKey: "bundle" },
];
```

Amounts are in **minor units** (cents): `3990` = 39.90. Setting `inStock: false`
switches that card to the translated out-of-stock state, disables add-to-cart,
rejects it at the API, and updates the `availability` in the Product schema.

### Add real product images

1. Put the file in `public/images/` using the `expectedFile` name from
   **`src/config/media.ts`**.
2. Change that slot's `src` to the new file. Keep `width`/`height` as declared
   — they reserve the layout box so nothing shifts while the image loads.

| Slot | Expected file | Size | Shot |
| --- | --- | --- | --- |
| `hero` | `hero-q30.webp` | 1200×1200 | Q30 + phone + labelled jars |
| `step1` – `step3` | `step-1-type.webp` … | 900×700 | type · choose layout · print & stick |
| `useKitchen` … `useGifts` | `use-kitchen.webp` … | 800×800 | six use-case scenes |
| `gallery1` – `gallery5` | `gallery-1-front.webp` … | 1000×1000 | front · in hand · roll · with app · labels |
| `before` / `after` | `before-clutter.webp` / `after-order.webp` | 900×700 | same scene, unlabelled then labelled |
| `offerSingle` / `offerBundle` | `offer-single.webp` / `offer-bundle.webp` | 700×700 | one printer · two printers |
| `ogImage` | `og-share.jpg` | 1200×630 | social share card |

Every photo must show the **Q30 Aimo Mini** itself — do not substitute another
printer model. Alt text is translated in each locale file under `media.*`.

### Edit translations

All copy is in `locales/<code>.json`. The four files must keep **identical
key structures** — `ar.json` is the reference shape. `npm run typecheck`
catches a missing key, and `npm run locales:check` catches missing, extra and
empty strings in all four files at once.

To add a language: add its entry to `localeMeta` in `src/i18n/config.ts`, add
`locales/<code>.json`, and register it in `src/i18n/dictionaries.ts`.

### Connect a payment provider

`src/lib/checkout.ts` defines the contract; `src/app/api/checkout/route.ts`
exposes it. Set `CHECKOUT_PROVIDER` in `.env.local` to `stripe`, `shopify` or
`custom` and implement that branch — each one has commented scaffolding
showing the shape of the call. Keys go in environment variables only.

With no provider configured the API answers `501 not_configured` and the cart
renders a translated "checkout is not connected yet" message. **There is no
fake payment form anywhere in this store.**

### Connect the contact form

`src/lib/contact.ts` ships two transports — `webhook` and `resend` — selected
by `CONTACT_TRANSPORT`. Validation is shared between the browser form and the
API route, and errors come back as translation keys so they render in the
visitor's language. Unconfigured, the form says so instead of faking a send.

### Connect analytics

`src/lib/analytics.ts` emits typed events — `language_change`, `product_view`,
`offer_select`, `add_to_cart`, `begin_checkout`, `faq_open` — to any sink you
register:

```ts
registerAnalyticsSink((event) => myProvider.track(event.name, event.payload));
```

No third-party tracker is loaded. If you add one that needs cookie consent,
register the sink only after consent is given, and update the privacy page.

---

## How the language system works

| | |
| --- | --- |
| **Routes** | `/ar`, `/en`, `/tr`, `/he` — each language is separately indexable |
| **First visit** | `middleware.ts` matches `Accept-Language`; no match → Arabic |
| **Returning visit** | the `rattebha_locale` cookie wins over the browser header |
| **`<html lang dir>`** | set on the server per locale, not patched by script |
| **Switching** | navigates to the same page under the new prefix and keeps the cart |
| **Cart** | `localStorage`, keys independent of language, so a switch never clears it |
| **SEO** | canonical + `hreflang` for all four plus `x-default`, per-locale Open Graph |
| **Numbers** | Arabic uses `ar-u-nu-latn` (Western digits); every price is wrapped in a Unicode isolate so the currency symbol never detaches from the amount in RTL |
| **Icons** | direction-carrying icons opt in to mirroring with the `flip-rtl` class; product photos and logos never mirror |

---

## What is deliberately *not* claimed

This store does not invent facts. Three things are held back until they are
verified, and each is visible in the UI as a marked pending state:

1. **Printing languages.** The store interface is in four languages; that says
   nothing about which scripts the printer's app can print. The features
   section and the FAQ both state this plainly. After testing a real sample,
   update the FAQ answer in all four locale files and set
   `siteConfig.verifiedClaims.multilingualPrinting = true`.
2. **Box contents.** Same pattern, via `verifiedClaims.boxContents`.
3. **Reviews.** `src/data/reviews.ts` ships with `realReviews: []`. The sample
   cards render only in development (or with
   `NEXT_PUBLIC_SHOW_SAMPLE_CONTENT=true`) and are labelled as samples on
   screen. In production with no real reviews, the section is not rendered at
   all, and no `aggregateRating` is emitted in the structured data.

There are also no countdown timers, no fabricated scarcity, and no invented
customer or sales counts.

---

## Before you launch

Everything below needs real business data. The dev build shows a yellow
"needs data" note wherever one of these is still missing.

- [ ] `NEXT_PUBLIC_SITE_URL` — the production domain
- [ ] `siteConfig.business` — legal name, support email, phone, WhatsApp, address, support hours
- [ ] `siteConfig.policies` — shipping lead time, delivery time, countries served, return window, warranty, `lastUpdated`
- [ ] `siteConfig.verifiedClaims` — test a real Q30 sample, then update the FAQ copy and flip the flags
- [ ] `src/config/pricing.ts` — confirm final prices, currency and stock
- [ ] `public/images/*` — replace all 20 placeholders with real Q30 photography
- [ ] `src/data/reviews.ts` — add verified reviews, or leave the array empty
- [ ] `.env.local` — configure the checkout provider and the contact transport
- [ ] Have the four policy pages reviewed by someone qualified for your market

---

## Accessibility and performance notes

- Mobile-first; verified with no horizontal overflow at 390 px in all four languages.
- Skip link is the first tab stop; the cart drawer traps focus and closes on `Escape`.
- Visible 3 px focus ring on every interactive element; tap targets are at least 44 px.
- All images declare intrinsic dimensions, so there is no layout shift on load.
- Fonts are self-hosted by `next/font` (Rubik for Latin/Turkish/Hebrew, IBM Plex
  Sans Arabic for Arabic) with size-adjusted fallbacks.
- Scroll reveals are pure CSS, gated behind a `.js` class so content is fully
  visible without JavaScript, and disabled under `prefers-reduced-motion`.
