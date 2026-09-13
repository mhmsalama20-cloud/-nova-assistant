/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONTACT FORM LAYER (pluggable)
 * ─────────────────────────────────────────────────────────────────────────────
 *  Validation runs on both sides; delivery goes through a transport you plug
 *  in. Until a transport is configured the API answers `not_configured` and
 *  the form says so honestly instead of faking a successful send.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const contactTopics = ["product", "order", "shipping", "returns", "other"] as const;
export type ContactTopic = (typeof contactTopics)[number];

export type ContactInput = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

/** Keys under `contact.errors` in the locale files. */
export type ContactErrorKey =
  | "nameRequired"
  | "nameTooShort"
  | "emailRequired"
  | "emailInvalid"
  | "messageRequired"
  | "messageTooShort"
  | "messageTooLong"
  | "topicInvalid";

export type ContactFieldErrors = Partial<Record<keyof ContactInput, ContactErrorKey>>;

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the client form and the API route, so both agree on the rules. */
export function validateContact(input: ContactInput): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (!name) errors.name = "nameRequired";
  else if (name.length < 2) errors.name = "nameTooShort";

  if (!email) errors.email = "emailRequired";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "emailInvalid";

  if (!contactTopics.includes(input.topic as ContactTopic)) errors.topic = "topicInvalid";

  if (!message) errors.message = "messageRequired";
  else if (message.length < MESSAGE_MIN) errors.message = "messageTooShort";
  else if (message.length > MESSAGE_MAX) errors.message = "messageTooLong";

  return errors;
}

export type ContactTransportResult =
  | { status: "sent" }
  | { status: "not_configured" }
  | { status: "error"; reason: string };

export type ContactTransport = (input: ContactInput) => Promise<ContactTransportResult>;

/**
 * Selects a transport from the environment.
 *
 *   CONTACT_TRANSPORT=webhook   + CONTACT_WEBHOOK_URL
 *   CONTACT_TRANSPORT=resend    + RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL
 *
 * Anything else (the default) leaves the form unconnected.
 */
export function getContactTransport(): ContactTransport {
  const name = (process.env.CONTACT_TRANSPORT || "none").toLowerCase();

  if (name === "webhook") {
    const url = process.env.CONTACT_WEBHOOK_URL;
    if (!url) return async () => ({ status: "not_configured" });
    return async (input) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        return response.ok
          ? { status: "sent" }
          : { status: "error", reason: `webhook_status_${response.status}` };
      } catch {
        return { status: "error", reason: "webhook_unreachable" };
      }
    };
  }

  if (name === "resend") {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!apiKey || !to || !from) return async () => ({ status: "not_configured" });
    return async (input) => {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [to],
            reply_to: input.email,
            subject: `[Rattebha] ${input.topic} — ${input.name}`,
            text: `From: ${input.name} <${input.email}>\nTopic: ${input.topic}\n\n${input.message}`,
          }),
        });
        return response.ok
          ? { status: "sent" }
          : { status: "error", reason: `resend_status_${response.status}` };
      } catch {
        return { status: "error", reason: "resend_unreachable" };
      }
    };
  }

  return async () => ({ status: "not_configured" });
}
