"use client";

import { useEffect, type ReactNode } from "react";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StickyBuyBar } from "@/components/layout/StickyBuyBar";
import { CartProvider } from "@/context/CartProvider";
import { LocaleProvider } from "@/context/LocaleProvider";
import { siteConfig } from "@/config/site";
import type { Direction, Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { track } from "@/lib/analytics";

/**
 * Chrome shared by every page: providers, header, footer, cart drawer and the
 * sticky mobile buy bar.
 */
export function StoreShell({
  locale,
  dir,
  dictionary,
  children,
  showStickyBar = false,
}: {
  locale: Locale;
  dir: Direction;
  dictionary: Dictionary;
  children: ReactNode;
  showStickyBar?: boolean;
}) {
  return (
    <LocaleProvider locale={locale} dir={dir} dictionary={dictionary}>
      <CartProvider>
        <MarkJsEnabled />
        <a
          href="#main"
          className="sr-only rounded-full bg-violet-600 px-4 py-2 font-bold text-white focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-100"
        >
          {dictionary.nav.skipToContent}
        </a>
        <AnnouncementBar d={dictionary} />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        {showStickyBar ? <StickyBuyBar /> : null}
      </CartProvider>
    </LocaleProvider>
  );
}

/**
 * Adds `.js` to <html> once React has mounted. The scroll-reveal animation
 * is scoped to that class, so with JavaScript disabled every section is
 * simply visible instead of stuck at zero opacity.
 */
function MarkJsEnabled() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    return () => document.documentElement.classList.remove("js");
  }, []);
  return null;
}

/** Fires the product-view event once per locale visit to the product page. */
export function TrackProductView({ locale }: { locale: Locale }) {
  useEffect(() => {
    track({ name: "product_view", payload: { sku: siteConfig.productSku, locale } });
  }, [locale]);
  return null;
}
