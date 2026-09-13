import Image from "next/image";

import type { MediaSlot } from "@/config/media";
import { cn } from "@/lib/cn";

/**
 * Renders an image from the registry in `src/config/media.ts`.
 *
 * Width and height always come from the registry, so the browser reserves the
 * correct box before the file loads and the layout never shifts.
 */
export function Media({
  slot,
  alt,
  className,
  imageClassName,
  sizes,
  priority = false,
  rounded = true,
}: {
  slot: MediaSlot;
  /** Already-translated alt text. */
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-violet-50",
        rounded && "rounded-[var(--radius-card)]",
        className,
      )}
      style={{ aspectRatio: `${slot.width} / ${slot.height}` }}
    >
      <Image
        src={slot.src}
        alt={alt}
        width={slot.width}
        height={slot.height}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
    </div>
  );
}
