"use client";

import { CheckCircle2, Send, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/context/LocaleProvider";
import {
  contactTopics,
  validateContact,
  MESSAGE_MAX,
  type ContactFieldErrors,
  type ContactInput,
} from "@/lib/contact";
import { cn } from "@/lib/cn";

type Status = "idle" | "sending" | "sent" | "not_configured" | "error";

const emptyForm: ContactInput = { name: "", email: "", topic: "product", message: "" };

/**
 * Validates on the client with the same rules the API route re-applies on the
 * server. Delivery goes through the pluggable transport in `src/lib/contact.ts`
 * — when none is configured the form says so plainly rather than pretending
 * the message was sent.
 */
export function ContactForm() {
  const { d } = useI18n();
  const [values, setValues] = useState<ContactInput>(emptyForm);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formId = useId();

  function update<K extends keyof ContactInput>(field: K, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstField = Object.keys(found)[0];
      document.getElementById(`${formId}-${firstField}`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as {
        status?: string;
        errors?: ContactFieldErrors;
      };

      if (data.status === "sent") {
        setStatus("sent");
        setValues(emptyForm);
        return;
      }
      if (data.status === "invalid" && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }
      setStatus(data.status === "not_configured" ? "not_configured" : "error");
    } catch {
      setStatus("error");
    }
  }

  const fieldClass = (hasError: boolean) =>
    cn(
      "w-full rounded-2xl border-2 bg-white px-4 py-3 text-base transition-colors",
      "placeholder:text-ink-300",
      hasError
        ? "border-red-400 focus-visible:outline-red-500"
        : "border-violet-100 hover:border-violet-200 focus-visible:outline-violet-600",
    );

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-card)] bg-violet-50 p-6 text-center ring-1 ring-violet-200"
      >
        <CheckCircle2 className="mx-auto size-10 text-violet-600" aria-hidden="true" />
        <p className="mt-3 text-lg font-extrabold">{d.contact.successTitle}</p>
        <p className="mt-1 text-ink-500">{d.contact.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {status === "not_configured" || status === "error" ? (
        <div
          role="alert"
          className={cn(
            "flex gap-3 rounded-2xl p-4 text-sm",
            status === "not_configured"
              ? "bg-sunny-50 text-ink-700 ring-1 ring-sunny-500/50"
              : "bg-red-50 text-red-800 ring-1 ring-red-200",
          )}
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            <strong className="block font-bold">
              {status === "not_configured"
                ? d.contact.notConfiguredTitle
                : d.contact.errorTitle}
            </strong>
            {status === "not_configured"
              ? d.contact.notConfiguredBody
              : d.contact.errorBody}
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-name`} className="mb-1.5 block font-bold">
            {d.contact.name}
            <span className="ms-1 text-sm font-medium text-ink-300">
              ({d.common.required})
            </span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            placeholder={d.contact.namePlaceholder}
            className={fieldClass(Boolean(errors.name))}
          />
          {errors.name ? (
            <p id={`${formId}-name-error`} className="mt-1.5 text-sm font-semibold text-red-600">
              {d.contact.errors[errors.name]}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className="mb-1.5 block font-bold">
            {d.contact.email}
            <span className="ms-1 text-sm font-medium text-ink-300">
              ({d.common.required})
            </span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            placeholder={d.contact.emailPlaceholder}
            className={cn(fieldClass(Boolean(errors.email)), "text-start")}
          />
          {errors.email ? (
            <p id={`${formId}-email-error`} className="mt-1.5 text-sm font-semibold text-red-600">
              {d.contact.errors[errors.email]}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor={`${formId}-topic`} className="mb-1.5 block font-bold">
          {d.contact.topic}
        </label>
        <select
          id={`${formId}-topic`}
          name="topic"
          value={values.topic}
          onChange={(event) => update("topic", event.target.value)}
          className={fieldClass(Boolean(errors.topic))}
        >
          {contactTopics.map((topic) => (
            <option key={topic} value={topic}>
              {d.contact.topics[topic]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${formId}-message`} className="mb-1.5 block font-bold">
          {d.contact.message}
          <span className="ms-1 text-sm font-medium text-ink-300">
            ({d.common.required})
          </span>
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${formId}-message-error` : undefined}
          placeholder={d.contact.messagePlaceholder}
          className={cn(fieldClass(Boolean(errors.message)), "resize-y")}
        />
        {errors.message ? (
          <p id={`${formId}-message-error`} className="mt-1.5 text-sm font-semibold text-red-600">
            {d.contact.errors[errors.message]}
          </p>
        ) : null}
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={status === "sending"}>
        <Send className="size-5 shrink-0 flip-rtl" aria-hidden="true" />
        {status === "sending" ? d.contact.sending : d.contact.submit}
      </Button>
    </form>
  );
}
