import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";
import { defaultLocale, localeMeta } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { href } from "@/i18n/routing";

/**
 * A not-found page cannot read the route params, so it falls back to the
 * default language. Every other page resolves its own locale normally.
 */
export default function NotFound() {
  const d = getDictionary(defaultLocale);

  return (
    <div
      lang={localeMeta[defaultLocale].htmlLang}
      dir={localeMeta[defaultLocale].dir}
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"
    >
      <p className="text-6xl font-extrabold text-violet-200">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">{d.common.notFoundTitle}</h1>
      <p className="mt-2 text-ink-500">{d.common.notFoundBody}</p>
      <Link href={href(defaultLocale)} className={buttonClass("primary", "md", "mt-6")}>
        {d.common.backHome}
      </Link>
    </div>
  );
}
