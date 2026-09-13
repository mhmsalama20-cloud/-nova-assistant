import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/contact/ContactForm";
import { StoreShell } from "@/components/layout/StoreShell";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { hasBusinessContact, siteConfig } from "@/config/site";
import { getDirection, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return buildPageMetadata({
    locale,
    d,
    route: "contact",
    title: `${d.contact.title} — ${d.brand.latin}`,
    description: d.contact.description,
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);

  const { email, phone, whatsapp, supportHours } = siteConfig.business;
  const details = [
    email ? { icon: Mail, value: email, href: `mailto:${email}` } : null,
    phone ? { icon: Phone, value: phone, href: `tel:${phone.replace(/\s/g, "")}` } : null,
    whatsapp
      ? {
          icon: MessageCircle,
          value: whatsapp,
          href: whatsapp.startsWith("http")
            ? whatsapp
            : `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
        }
      : null,
  ].filter((detail) => detail !== null);

  return (
    <StoreShell locale={locale} dir={getDirection(locale)} dictionary={d}>
      <div className="bg-white py-14 sm:py-20">
        <div className="container-page grid max-w-5xl gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{d.contact.title}</h1>
            <p className="mt-3 text-lg text-ink-500">{d.contact.description}</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <aside className="rounded-[var(--radius-card)] bg-sand-100 p-6">
            <h2 className="text-lg font-extrabold">{d.contact.detailsTitle}</h2>
            {hasBusinessContact() ? (
              <ul className="mt-4 space-y-3">
                {details.map((detail) => {
                  const Icon = detail.icon;
                  return (
                    <li key={detail.value}>
                      <a
                        href={detail.href}
                        dir="ltr"
                        className="inline-flex items-center gap-2 font-semibold text-violet-700 underline underline-offset-4"
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        {detail.value}
                      </a>
                    </li>
                  );
                })}
                {supportHours ? (
                  <li className="text-sm text-ink-500">{supportHours}</li>
                ) : null}
              </ul>
            ) : (
              <>
                <p className="mt-3 text-ink-500">{d.contact.detailsPending}</p>
                <SetupNotice title={d.common.setupNoticeTitle} className="mt-4">
                  <p className="font-mono text-xs">siteConfig.business.email / phone / whatsapp</p>
                </SetupNotice>
              </>
            )}
          </aside>
        </div>
      </div>
    </StoreShell>
  );
}
