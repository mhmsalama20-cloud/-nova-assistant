# Where to look

Replace `<q>` with a URL-encoded keyword and `<cc>` with a country code. Swap the Amazon domain for the target market (amazon.sa, amazon.ae, amazon.eg, amazon.co.uk, amazon.de).

Many of these pages render with JavaScript or need a login, so a plain fetch can come back empty. When that happens, say so and ask the user for a screenshot or an export. Don't guess what the page would have shown.

## Proof of sales

### Amazon

| Page | URL | What it tells you |
|---|---|---|
| Best Sellers | `https://www.amazon.com/Best-Sellers/zgbs` (drill into a category) | What sells most right now, by category, refreshed hourly |
| Movers & Shakers | `https://www.amazon.com/gp/movers-and-shakers` | Biggest rank jumps in 24 hours: early trend signal |
| New Releases | `https://www.amazon.com/gp/new-releases` | New products already selling well |
| Most Wished For | `https://www.amazon.com/gp/most-wished-for` | Demand that hasn't converted yet, often price-sensitive |
| Search | `https://www.amazon.com/s?k=<q>` | Competition density, price spread, review counts |

Reading signals:
- Best Sellers Rank (BSR) under about 5,000 in a main category usually means steady daily sales. Don't turn BSR into exact unit sales without a data tool; mark any conversion ⚠️.
- Several sellers with few reviews (under 300) on page one means room to enter. Page one owned by products with 5,000+ reviews or Amazon Basics means a hard market.
- "X bought in past month" labels on search results are first-party numbers. Quote them as shown.
- These thresholds are rough amazon.com benchmarks. Each marketplace ranks separately, and the same rank means far fewer sales on a smaller one such as amazon.sa, amazon.ae or amazon.eg. There, judge rank and review counts against the top 10 results in the same category on the same marketplace instead of these fixed numbers.

### noon (Gulf and Egypt)

`https://www.noon.com/saudi-en/search/?q=<q>` (or `uae-en`, `egypt-en`). Check best-seller badges, review counts and the price spread for the local market.

### eBay sold listings

`https://www.ebay.com/sch/i.html?_nkw=<q>&LH_Sold=1&LH_Complete=1` shows items that actually sold, with prices and dates. Sold count against active listings gives a rough sell-through rate.

### AliExpress and suppliers

- AliExpress search: `https://www.aliexpress.com/w/wholesale-<q>.html`. The "sold" count and rating on each listing are useful volume and quality signals. Prefer listings with a 4.7+ store rating and thousands sold.
- Alibaba (`https://www.alibaba.com/trade/search?SearchText=<q>`) for unit price at volume and MOQ.
- CJdropshipping and similar agents for warehouses in the target country (shorter shipping, lower refund rates).
- Always note shipping time to the target country. Over 12 days hurts conversion and raises refunds.

### TikTok

- **Creative Center → Inspiration → Top Products** (`ads.tiktok.com/business/creativecenter`, desktop, needs login): best-converting products by country and category with CTR, CPA and example ads. Usually not fetchable; ask the user for a screenshot.
- Creative Center Top Ads and Trends (hashtags, songs) for content angles.
- Web search for `"tiktok made me buy it" <q>` and `<q> tiktok viral` finds products that went viral and articles listing them.
- TikTok Shop listings show sold counts per product where available.

### Meta Ad Library

`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=<cc>&q=<q>`

- An ad that has been active for 30+ days is probably profitable: nobody keeps paying for a losing ad.
- Many variations of the same product ad from one advertiser means they are scaling.
- Many different stores running the same product means it is saturated. Look for a different angle or skip it.

The page needs JavaScript. If fetching fails, ask the user to search it and share screenshots.

## Competitor Shopify stores

Find stores: web search `site:myshopify.com <q>` or `"powered by shopify" <q>`. A store runs Shopify if its HTML references `cdn.shopify.com`.

Public endpoints (no login; unofficial, so some stores block them; keep requests few and polite):

| Endpoint | Use |
|---|---|
| `https://<store>/products.json?limit=250&page=1` | Full catalog: title, `product_type`, `vendor`, `created_at`, `published_at`, variant `price` and `compare_at_price`, `available` |
| `https://<store>/collections/all?sort_by=best-selling` | Product order approximates the store's best sellers |
| `https://<store>/sitemap.xml` | Product count and URLs |

What to extract:
- Products with the newest `created_at` show what the store is testing now.
- `compare_at_price` versus `price` shows the discount strategy.
- The first items in best-selling order, cross-checked against their ads in the Meta Ad Library, are the store's likely winners.

## Demand and trend

- **Google Trends**: `https://trends.google.com/trends/explore?date=today%205-y&geo=<CC>&q=<q>`. Use the 5-year view to tell an evergreen product (steady or rising) from a fad (one spike). Compare 2 to 5 keywords at once. Often needs JavaScript; use a Google Trends MCP tool if connected or ask the user for a screenshot.
- **Autocomplete**: how many long-tail variations Google and Amazon suggest for the keyword is a cheap demand signal.
- **Seasonality**: note peak months; launch 6 to 8 weeks before the peak.

## Customer voice

- Amazon 1 to 3 star reviews on the top 3 competitors: repeated complaints are your improvement or ad angle.
- Reddit: web search `site:reddit.com <q> worth it` or `site:reddit.com <q> recommendation`.
- Trustpilot reviews for competitor stores (service and shipping complaints).

## Optional data tools (MCP)

If any of these are connected, use them for numbers and treat the pages above as context:

- **Apify** (official, many ready scrapers for Amazon, AliExpress, TikTok Shop and Google Trends; paid per use)
- **Helium 10** and **Jungle Scout** (each vendor's official MCP server: Amazon sales estimates, keywords, competitors; high-tier paid plans). The sales numbers come from the vendor's own model, not from Amazon, so mark them ⚠️.
- **Keepa** (Amazon price and rank history)
- **Google Trends** community servers (free, unofficial, can break without notice)
