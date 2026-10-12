#!/usr/bin/env python3
"""Per-order profit for a product you plan to sell with paid ads.

Example:
    python3 profit.py --price 39.99 --cost 8.5 --shipping 4 --cpa 12
"""

import argparse
import json
import sys


def calculate(price, cost, shipping, cpa=0.0, charged_shipping=0.0,
              platform_fee=0.0, payment_fee=2.9, payment_fixed=0.30,
              returns=0.0, other=0.0):
    revenue = price + charged_shipping
    landed = cost + shipping
    fees = revenue * (platform_fee + payment_fee) / 100 + payment_fixed
    refund_loss = revenue * returns / 100
    costs_before_ads = landed + fees + refund_loss + other
    # What one order leaves before ads; also the most you can pay per sale.
    break_even_cpa = revenue - costs_before_ads
    net = break_even_cpa - cpa
    return {
        "revenue": revenue,
        "landed_cost": landed,
        "fees": fees,
        "refund_loss": refund_loss,
        "other": other,
        "cpa": cpa,
        "net_profit": net,
        "net_margin_pct": net / revenue * 100 if revenue else 0.0,
        "break_even_cpa": break_even_cpa,
        "break_even_roas": revenue / break_even_cpa if break_even_cpa > 0 else None,
        "roas_at_cpa": revenue / cpa if cpa > 0 else None,
        "revenue_to_landed": revenue / landed if landed else None,
    }


def verdict(r):
    if r["break_even_cpa"] <= 0:
        return "Loses money before any ads: raise the price or find a cheaper supplier."
    if r["net_profit"] < 0:
        return f"Loses money at this CPA: ads must cost under {r['break_even_cpa']:.2f} per sale."
    if r["net_margin_pct"] < 15:
        return "Too thin: under 15% net at this CPA."
    if r["break_even_roas"] > 3:
        return "Risky: needs a ROAS above 3 just to break even."
    if r["net_margin_pct"] >= 25 and r["break_even_roas"] <= 1.8:
        return "Healthy margin."
    return "Workable, but watch the ad cost closely."


def fmt(value, suffix=""):
    return "n/a" if value is None else f"{value:,.2f}{suffix}"


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--price", type=float, required=True, help="selling price")
    p.add_argument("--cost", type=float, required=True, help="product cost per unit from the supplier")
    p.add_argument("--shipping", type=float, default=0.0, help="what you pay to ship one order")
    p.add_argument("--cpa", type=float, default=0.0, help="ad spend per purchase")
    p.add_argument("--charged-shipping", type=float, default=0.0, help="shipping the customer pays you")
    p.add_argument("--platform-fee", type=float, default=0.0,
                   help="marketplace or platform fee, %% of revenue (Amazon referral ~15, TikTok Shop and noon vary). "
                        "Amazon's referral fee already covers payment processing, so with it pass --payment-fee 0 --payment-fixed 0")
    p.add_argument("--payment-fee", type=float, default=2.9, help="payment processing, %% of revenue")
    p.add_argument("--payment-fixed", type=float, default=0.30, help="fixed payment fee per order, in the same currency as --price (default is a US card rate)")
    p.add_argument("--returns", type=float, default=0.0, help="%% of orders refunded")
    p.add_argument("--other", type=float, default=0.0, help="other per-order costs: packaging, apps, agent fee")
    p.add_argument("--json", action="store_true", help="print JSON instead of text")
    a = p.parse_args(argv)

    for name in ("price", "cost", "shipping", "cpa", "charged_shipping", "platform_fee",
                 "payment_fee", "payment_fixed", "returns", "other"):
        if getattr(a, name) < 0:
            p.error(f"--{name.replace('_', '-')} can't be negative")
    if a.price <= 0:
        p.error("--price must be greater than 0")

    r = calculate(a.price, a.cost, a.shipping, a.cpa, a.charged_shipping,
                  a.platform_fee, a.payment_fee, a.payment_fixed, a.returns, a.other)
    r["verdict"] = verdict(r)

    if a.json:
        rounded = {k: round(v, 2) if isinstance(v, float) else v for k, v in r.items()}
        json.dump(rounded, sys.stdout, indent=2)
        print()
        return

    print(f"Revenue per order:  {fmt(r['revenue'])}")
    print(f"Landed cost:        {fmt(r['landed_cost'])}  (revenue is {fmt(r['revenue_to_landed'], 'x')} landed cost)")
    print(f"Fees:               {fmt(r['fees'])}")
    print(f"Refund allowance:   {fmt(r['refund_loss'])}")
    print(f"Other costs:        {fmt(r['other'])}")
    print(f"Ad cost (CPA):      {fmt(r['cpa'])}")
    print(f"Net profit/order:   {fmt(r['net_profit'])}  ({fmt(r['net_margin_pct'], '%')})")
    print(f"Break-even CPA:     {fmt(r['break_even_cpa'])}")
    print(f"Break-even ROAS:    {fmt(r['break_even_roas'])}")
    print(f"ROAS at this CPA:   {fmt(r['roas_at_cpa'])}")
    print(f"Verdict:            {r['verdict']}")


if __name__ == "__main__":
    main()
