"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { siteConfig } from "@/config/site";
import { useI18n } from "@/context/LocaleProvider";
import { href, type RouteKey } from "@/i18n/routing";

export function Footer() {
  const { d, locale } = useI18n();
  const year = new Date().getFullYear();

  const policyLinks: Array<{ route: RouteKey; label: string }> = [
    { route: "shipping", label: d.footer.shipping },
    { route: "returns", label: d.footer.returns },
    { route: "privacy", label: d.footer.privacy },
    { route: "terms", label: d.footer.terms },
  ];

  const sectionLinks = [
    { hash: "features", label: d.nav.features },
    { hash: "how", label: d.nav.how },
    { hash: "offers", label: d.nav.offers },
    { hash: "faq", label: d.nav.faq },
  ];

  return (
    <footer
      className="bg-violet-900 text-violet-100"
      // Keeps the last row clear of the sticky mobile buy bar.
      style={{ paddingBottom: "var(--sticky-bar-height)" }}
    >
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-2xl font-extrabold text-white">
            {locale === "ar" ? d.brand.name : d.brand.latin}
          </p>
          <p className="mt-1 text-sm font-semibold text-sunny-300">{d.brand.tagline}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{d.footer.about}</p>
        </div>

        <nav aria-labelledby="footer-links">
          <h2 id="footer-links" className="text-sm font-extrabold text-white uppercase">
            {d.footer.linksTitle}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {sectionLinks.map((link) => (
              <li key={link.hash}>
                <Link
                  href={`${href(locale)}#${link.hash}`}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href(locale, "contact")} className="transition-colors hover:text-white">
                {d.footer.contact}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-policies">
          <h2 id="footer-policies" className="text-sm font-extrabold text-white uppercase">
            {d.footer.policiesTitle}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {policyLinks.map((link) => (
              <li key={link.route}>
                <Link
                  href={href(locale, link.route)}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-extrabold text-white uppercase">
            {d.footer.languageTitle}
          </h2>
          <LanguageSwitcher variant="footer" className="mt-4" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="ltr-num">{year}</span> ·{" "}
            {siteConfig.business.legalName || d.brand.latin} · {d.footer.rights}
          </p>
          <p className="text-violet-200/80">{d.footer.productNote}</p>
        </div>
      </div>
    </footer>
  );
}
