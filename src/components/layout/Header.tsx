"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CartButton } from "@/components/cart/CartButton";
import { Logo } from "@/components/layout/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { buttonClass } from "@/components/ui/Button";
import { useI18n } from "@/context/LocaleProvider";
import { href } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * Sticky navigation. On mobile it collapses into a slide-down panel; the
 * cart, the language menu and the order button stay reachable at every size.
 */
export function Header() {
  const { locale, d } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock the page behind the open mobile panel.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const links = [
    { id: "features", label: d.nav.features },
    { id: "how", label: d.nav.how },
    { id: "offers", label: d.nav.offers },
    { id: "faq", label: d.nav.faq },
  ];

  const home = href(locale);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-shadow duration-200",
        scrolled
          ? "bg-white/95 shadow-[0_1px_0_rgba(27,16,51,0.08),0_12px_28px_-24px_rgba(27,16,51,0.5)] backdrop-blur"
          : "bg-white",
      )}
    >
      <div className="container-page flex min-h-16 items-center justify-between gap-3 py-2 lg:min-h-20">
        {/* Display toggles live on wrappers: a `hidden` utility on the
            element itself would compete with the component's own
            `inline-flex` base class. */}
        <div className="lg:hidden">
          <Logo
            locale={locale}
            arabicName={d.brand.name}
            latinName={d.brand.latin}
            tagline={d.brand.tagline}
            homeLabel={d.nav.home}
            compact
          />
        </div>
        <div className="hidden lg:block">
          <Logo
            locale={locale}
            arabicName={d.brand.name}
            latinName={d.brand.latin}
            tagline={d.brand.tagline}
            homeLabel={d.nav.home}
          />
        </div>

        <nav aria-label={d.nav.home} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={`${home}#${link.id}`}
                  className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-bold text-ink-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:block" />
          <CartButton />
          <div className="hidden sm:block">
            <Link href={`${home}#offers`} className={buttonClass("accent", "sm")}>
              {d.nav.order}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? d.nav.closeMenu : d.nav.openMenu}
            className="inline-flex size-11 items-center justify-center rounded-full border-2 border-violet-100 bg-white text-ink-700 transition-colors hover:border-violet-300 lg:hidden"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-violet-100 bg-white lg:hidden"
      >
        <nav aria-label={d.nav.home} className="container-page py-4">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={`${home}#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center rounded-xl px-3 text-base font-bold text-ink-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 border-t border-violet-100 pt-4">
            <LanguageSwitcher className="sm:hidden" />
            <Link
              href={`${home}#offers`}
              onClick={() => setOpen(false)}
              className={buttonClass("accent", "md", "w-full")}
            >
              {d.nav.order}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
