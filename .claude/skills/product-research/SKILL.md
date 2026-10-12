---
name: product-research
description: Find and validate products to sell online (Shopify, dropshipping, Amazon, TikTok Shop, noon, Salla/Zid, Etsy, eBay). Discovers candidates from several live signals, checks demand, competition, supplier cost and risk, runs a profit calculation, and returns a ranked shortlist where every number has a source. Use when the user asks what to sell, wants winning or trending products, wants a niche or a specific product checked, or asks about a competitor store. Arabic triggers include "منتجات رابحة", "دورلي على منتجات", "شو أبيع", "منتج ترند", "دروبشيبنج", "شوبيفاي", "متجر منافس", "تحليل منتج".
---

# Product research

Goal: a short, ranked list of products the user could realistically test, backed by evidence they can click and check. Accuracy matters more than volume: three well-checked products beat twenty guesses.

Reply in the user's language (Arabic if they write in Arabic). Keep product names, links and numbers in their original form.

## Ground rules

- **Check web access once, before discovery.** WebFetch one retail page (for example `https://www.amazon.com/gp/movers-and-shakers`). If it fails at the network level (a DNS error such as `ENOTFOUND`, or a proxy or tunnel error), the session's network blocks shopping sites. This is normal in Claude Code cloud sessions on the default network level. Treat every retail URL in `references/sources.md` as blocked for the rest of the session instead of trying them one by one, and tell the user in one line: run Claude Code on their own computer, or allow the shopping sites under the environment's Network access (https://code.claude.com/docs/en/cloud-environments#network-access). Then fall back, in this order, to connected MCP data tools (their traffic isn't subject to the session's network allowlist), WebSearch (cite each result URL and date), and user screenshots for the top 3 candidates at most. A page that loads but shows a captcha or login wall blocks that one site only, not the whole network.
- **Never invent numbers.** Sales, search volume, prices, review counts and ad counts must come from a page or tool you actually read in this session. Put the source link next to each number, and the date you read it.
- **Label estimates.** Anything you derive (monthly sales from BSR, margin from a guessed shipping cost) gets a ⚠️ and a one-line note on how you got it.
- **Two signal types per product.** Don't call a product validated on one signal. Demand (trends, searches) plus proof of sales (best-seller lists, sold counts, long-running ads) is the minimum. A product without both is reported as "Unverified, watch list", not scored as validated.
- **All profit math goes through the calculator.** Every net profit, margin, break-even CPA or ROAS you state, in the report or in any later what-if answer (new price, new CPA, another product), comes from running `python3 "${CLAUDE_SKILL_DIR}/scripts/profit.py"`, never from mental arithmetic.
- **Say what you couldn't reach.** If a site blocks you or needs a login (TikTok Creative Center, Meta Ad Library and Google Trends often do), say so and ask the user for a screenshot or a pasted export instead of filling the gap.
- **Prefer connected data tools.** If MCP tools for marketplace data are connected (for example Apify, Helium 10, Jungle Scout, Keepa or Google Trends tools), use them for hard numbers and use web pages for context.

## Workflow

### 0. Pick the mode

- A store URL: go to **Competitor store mode** below. Ask only for the target market if it's unclear.
- One named product or product link: ask only for the target market and sales channel if they're missing (they set prices and fees), skip steps 2 and 3, run steps 4 to 6 for that product, and report one product card instead of the ranked table.
- Anything else: the full workflow from step 1.

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

Run the calculator for every finalist:

```bash
python3 "${CLAUDE_SKILL_DIR}/scripts/profit.py" \
  --price <sell price> --cost <supplier unit cost> --shipping <shipping per order> --cpa <ad cost per sale> \
  --platform-fee <channel fee %> --payment-fee <gateway %> --payment-fixed <gateway fixed fee> --returns <refund or COD-refusal %>
```

Run `python3 "${CLAUDE_SKILL_DIR}/scripts/profit.py" --help` for all options (shipping charged to the customer, other per-order costs, `--json`). Report net profit per order, margin, break-even CPA and break-even ROAS.

Fees and refund rates depend on the channel and country. The script's defaults (2.9% + 0.30 payment fee, 0% returns) assume a US card gateway; use the real gateway and marketplace fees for the target market. On Amazon, pass `--payment-fee 0 --payment-fixed 0`, because the referral fee already covers payment processing; for TikTok Shop and noon, check the seller fee page before adding a separate payment fee. If a value has no source (CPA, refund rate, shipping), mark it ⚠️ and run the calculator at a low and a high value to show the range.

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
