import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Top strip of trust points. The three promises stay short here and are
 * detailed on the policy pages.
 */
export function AnnouncementBar({ d }: { d: Dictionary }) {
  const items = [
    { icon: Truck, label: d.announcement.shipping },
    { icon: ShieldCheck, label: d.announcement.payment },
    { icon: RotateCcw, label: d.announcement.warranty },
  ];

  return (
    <div className="bg-violet-900 text-violet-50">
      <ul className="container-page flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-[0.7rem] font-semibold sm:gap-x-8 sm:text-sm">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-1.5">
            <Icon className="size-3.5 shrink-0 text-sunny-400 sm:size-4" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
