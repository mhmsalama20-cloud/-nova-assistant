import { StoreShell } from "@/components/layout/StoreShell";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { buttonClass } from "@/components/ui/Button";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { getDirection, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { format, formatDate } from "@/i18n/format";
import { href } from "@/i18n/routing";

export type PolicyKey = "shipping" | "returns" | "privacy" | "terms";

/**
 * Shared shell for the four policy pages.
 *
 * Every clause has real, editable copy, but no clause states a figure the
 * business has not confirmed. Where `siteConfig.policies` is still unset, the
 * page shows a marked placeholder instead of an invented number.
 */
export function PolicyPage({
  locale,
  d,
  policy,
  pendingFields,
}: {
  locale: Locale;
  d: Dictionary;
  policy: PolicyKey;
  /** Config keys this policy needs before launch. */
  pendingFields: string[];
}) {
  const content = d.policies[policy];
  const sections = Object.entries(content.sections) as Array<
    [string, { title: string; body: string }]
  >;
  const lastUpdated = siteConfig.policies.lastUpdated;

  return (
    <StoreShell locale={locale} dir={getDirection(locale)} dictionary={d}>
      <article className="bg-white py-14 sm:py-20">
        <div className="container-page mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{content.title}</h1>
          <p className="mt-3 text-lg text-ink-500">{content.description}</p>
          <p className="mt-2 text-sm text-ink-300">
            {lastUpdated
              ? format(d.policies.lastUpdated, { date: formatDate(lastUpdated, locale) })
              : d.policies.lastUpdatedPending}
          </p>

          {pendingFields.length > 0 ? (
            <SetupNotice title={d.common.setupNoticeTitle} className="mt-6">
              <p>{d.policies.pendingBody}</p>
              <ul className="mt-2 list-disc space-y-1 ps-5 font-mono text-xs">
                {pendingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </SetupNotice>
          ) : null}

          <div className="mt-10 space-y-9">
            {sections.map(([key, section]) => (
              <section key={key}>
                <h2 className="text-xl font-extrabold">{section.title}</h2>
                <p className="mt-2 text-ink-700">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-[var(--radius-card)] bg-sand-100 p-6">
            <p className="font-bold">{d.policies.contactPrompt}</p>
            <Link
              href={href(locale, "contact")}
              className={buttonClass("primary", "md", "mt-4")}
            >
              {d.footer.contact}
            </Link>
          </div>
        </div>
      </article>
    </StoreShell>
  );
}
