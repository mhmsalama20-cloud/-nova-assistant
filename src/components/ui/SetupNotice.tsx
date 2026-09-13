import { AlertTriangle } from "lucide-react";

import { showSampleContent } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * A development-only banner marking content that still needs real business
 * data. It is not rendered in a production build unless
 * NEXT_PUBLIC_SHOW_SAMPLE_CONTENT is explicitly set to "true", so the live
 * store never shows an internal note to a shopper.
 */
export function SetupNotice({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!showSampleContent) return null;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border-2 border-dashed border-sunny-500 bg-sunny-50 p-4 text-start",
        className,
      )}
      role="note"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-sunny-700" aria-hidden="true" />
      <div className="text-sm leading-relaxed text-ink-700">
        <p className="font-bold text-ink-900">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}
