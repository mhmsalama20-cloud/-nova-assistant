import { NextResponse } from "next/server";

import { getContactTransport, validateContact, type ContactInput } from "@/lib/contact";

/**
 * Receives a contact message, re-validates it server-side with the same rules
 * the form uses, and hands it to the configured transport. Field errors come
 * back as translation keys so the client renders them in the active language.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: "invalid", errors: {} }, { status: 400 });
  }

  const raw = (body ?? {}) as Partial<ContactInput>;
  const input: ContactInput = {
    name: String(raw.name ?? "").trim(),
    email: String(raw.email ?? "").trim(),
    topic: String(raw.topic ?? ""),
    message: String(raw.message ?? "").trim(),
  };

  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ status: "invalid", errors }, { status: 422 });
  }

  const result = await getContactTransport()(input);

  const statusCode =
    result.status === "sent" ? 200 : result.status === "not_configured" ? 501 : 502;

  return NextResponse.json({ status: result.status }, { status: statusCode });
}
