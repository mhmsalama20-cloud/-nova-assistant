import { NextResponse } from "next/server";

import { createCheckoutSession } from "@/lib/checkout";

/**
 * Starts a checkout with whichever provider is configured.
 *
 * No payment is taken here — this route only asks the configured provider for
 * a hosted checkout URL. With no provider configured it answers
 * `not_configured`, which the cart renders as a clear message.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "invalid", reason: "bad_json" }, { status: 400 });
  }

  const { lines, locale } = (body ?? {}) as {
    lines?: Array<{ offerId: string; quantity: number }>;
    locale?: string;
  };

  const result = await createCheckoutSession({
    lines: Array.isArray(lines) ? lines : [],
    locale: typeof locale === "string" ? locale : "ar",
  });

  const statusCode =
    result.status === "redirect"
      ? 200
      : result.status === "invalid"
        ? 400
        : result.status === "not_configured"
          ? 501
          : 502;

  return NextResponse.json(result, { status: statusCode });
}
