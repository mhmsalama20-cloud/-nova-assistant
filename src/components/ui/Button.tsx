import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[transform,background-color,box-shadow,color] duration-200 " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none " +
  "active:translate-y-px motion-reduce:active:translate-y-0";

const variants: Record<Variant, string> = {
  // Warm yellow is the money button: offers, add-to-cart, checkout.
  accent:
    "bg-sunny-500 text-ink-900 shadow-[0_10px_24px_-12px_rgba(255,183,3,0.9)] " +
    "hover:bg-sunny-400 focus-visible:outline-ink-900",
  primary:
    "bg-violet-600 text-white shadow-[0_10px_28px_-14px_rgba(109,40,217,0.9)] " +
    "hover:bg-violet-500 focus-visible:outline-violet-800",
  outline:
    "border-2 border-violet-200 bg-white text-violet-700 " +
    "hover:border-violet-400 hover:bg-violet-50 focus-visible:outline-violet-600",
  ghost:
    "text-ink-700 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-violet-600",
};

const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-6 text-base",
  lg: "min-h-14 px-8 text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
