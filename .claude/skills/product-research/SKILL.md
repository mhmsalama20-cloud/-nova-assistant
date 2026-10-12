---
name: product-research
description: Find and validate products to sell online (Shopify, dropshipping, Amazon, TikTok Shop, noon, Salla/Zid, Etsy, eBay). Discovers candidates from several live signals, checks demand, competition, supplier cost and risk, runs a profit calculation, and returns a ranked shortlist where every number has a source. Use when the user asks what to sell, wants winning or trending products, wants a niche or a specific product checked, or asks about a competitor store. Arabic triggers include "منتجات رابحة", "دورلي على منتجات", "شو أبيع", "منتج ترند", "دروبشيبنج", "شوبيفاي", "متجر منافس", "تحليل منتج".
---

# Product research

Goal: a short, ranked list of products the user could realistically test, backed by evidence they can click and check. Accuracy matters more than volume: three well-checked products beat twenty guesses.

Reply in the user's language (Arabic if they write in Arabic). Keep product names, links and numbers in their original form.

## Ground rules

- **Never invent numbers.** Sales, search volume, prices, review counts and ad counts must come from a page or tool you actually read in this session. Put the source link next to each number, and the date you read it.
- **Label estimates.** Anything you derive (monthly sales from BSR, margin from a guessed shipping cost) gets a ⚠️ and a one-line note on how you got it.
- **Two signal types per product.** Don't call a product validated on one signal. Demand (trends, searches) plus proof of sales (best-seller lists, sold counts, long-running ads) is the minimum.
- **Say what you couldn't reach.** If a site blocks you or needs a login (TikTok Creative Center, Meta Ad Library and Google Trends often do), say so and ask the user for a screenshot or a pasted export instead of filling the gap.
- **Prefer connected data tools.** If MCP tools for marketplace data are connected (for example Apify, Helium 10, Jungle Scout, Keepa or Google Trends tools), use them for hard numbers and use web pages for context.

## Workflow

### 1. Brief

Take what the user already said. If key facts are missing, ask once, in a single message, with lettered options so they can answer in shorthand ("1b 2a 3c"):

1. Sales channel: Shopify/own store, Amazon, TikTok Shop, noon, Salla/Zid, Etsy, other
2. Target country/market (it changes prices, shipping and trends)
3. Fulfillment: dropshipping, own stock, print on demand
4. Starting budget and ad channel (Meta, TikTok, Google, organic)
5. Niche or interests, or "open to anything"
6. Selling price range they are comfortable with

If the user says "just go", assume: Shopify, dropshipping, the user's country if known otherwise US, Meta and TikTok ads, selling price $25 to $80.

### 2. Discover candidates

Pull 10 to 20 candidates from at least three different source types in `references/sources.md` (marketplace best sellers or movers, social or ad signals, competitor stores, supplier best sellers). Note where each candidate came from; a product that appears in several sources is a stronger lead.

### 3. Filter fast

Drop anything that hits a hard disqualifier in `references/scoring.md` (brand or IP copies, regulated items, hazardous shipping, margin that can't work). Keep the 3 to 7 strongest.

### 4. Validate each survivor

For each product gather:

- **Demand and trend**: 12-month and 5-year direction, seasonality.
- **Proof of sales**: best-seller rank and review growth, sold counts, ads running 30+ days, competitor stores featuring it.
- **Competition**: how many stores and ads already sell it, whether big brands or Amazon itself dominate, price spread.
- **Supplier**: unit cost, shipping cost and time to the target country, supplier rating, warehouse location.
- **Customer voice**: top complaints in 1 to 3 star reviews and on Reddit. These are the angles for a better offer.
- **Profit**: run the calculator (below) with real cost numbers.

### 5. Profit check

Run the calculator for every finalist instead of doing margin math in your head:

```bash
python3 .claude/skills/product-research/scripts/profit.py \
  --price 39.99 --cost 8.50 --shipping 4.00 --cpa 12 \
  --platform-fee 0 --payment-fee 2.9 --payment-fixed 0.30 --returns 5
```

Run `--help` for all options (marketplace referral fees, shipping charged to the customer, `--json`). Report net profit per order, margin, break-even CPA and break-even ROAS. If the CPA is a guess, run it at two or three values and show the range.

### 6. Score and rank

Score each product with the rubric in `references/scoring.md` and rank by total.

### 7. Report

Start with a ranked summary table:

| # | Product | Score /100 | Sell price | Landed cost | Net/order | Break-even ROAS | Verdict |

Then one card per product:

- What it is and who buys it (one line)
- Why now: the trend and sales evidence, each with a link
- Competition snapshot
- Supplier: link, unit cost, shipping time
- Profit block from the calculator
- Main risks
- Marketing angle drawn from customer complaints, and a 3-second video hook idea
- Next step: how to test it cheaply (for example one product page, a small ad budget for 3 to 5 days, the metric that decides go or stop)

End with a list of sources you couldn't access and what the user can paste or screenshot to close those gaps.

## Competitor store mode

When the user gives a store URL, check whether it runs on Shopify (`cdn.shopify.com` in the page), then use the Shopify endpoints in `references/sources.md` to list its products, newest launches, price points and discounts, and its best-seller order. Summarize what the store is pushing and which of its products pass the scoring rubric.
