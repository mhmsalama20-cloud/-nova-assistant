"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultOfferId,
  findOffer,
  getOffer,
  maxQuantityPerOffer,
  currency,
  type OfferId,
} from "@/config/pricing";
import { track } from "@/lib/analytics";

/**
 * Cart state lives in localStorage under a locale-independent key, so
 * switching language never clears the cart or the selected offer.
 */
const CART_STORAGE_KEY = "rattebha.cart.v1";
const OFFER_STORAGE_KEY = "rattebha.selectedOffer.v1";

export type CartLine = {
  offerId: OfferId;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  /** Total number of offer units in the cart. */
  itemCount: number;
  subtotalMinor: number;
  /** False until localStorage has been read, so the UI can avoid a flash. */
  hydrated: boolean;
  isOpen: boolean;
  selectedOfferId: OfferId;
  selectOffer: (offerId: OfferId) => void;
  addLine: (offerId: OfferId, quantity?: number) => void;
  setQuantity: (offerId: OfferId, quantity: number) => void;
  removeLine: (offerId: OfferId) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Re-validate against the current pricing config: an offer that was
    // removed or renamed must not linger in someone's saved cart.
    return parsed.flatMap((entry) => {
      if (typeof entry !== "object" || entry === null) return [];
      const { offerId, quantity } = entry as { offerId?: unknown; quantity?: unknown };
      const offer = typeof offerId === "string" ? findOffer(offerId) : undefined;
      const amount = Number(quantity);
      if (!offer || !Number.isInteger(amount) || amount < 1) return [];
      return [{ offerId: offer.id, quantity: Math.min(amount, maxQuantityPerOffer) }];
    });
  } catch {
    return [];
  }
}

function readStoredOffer(): OfferId {
  try {
    const raw = window.localStorage.getItem(OFFER_STORAGE_KEY);
    return findOffer(raw)?.id ?? defaultOfferId;
  } catch {
    return defaultOfferId;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<OfferId>(defaultOfferId);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Restore from localStorage after mount so server and client markup match.
  useEffect(() => {
    setLines(readStoredLines());
    setSelectedOfferId(readStoredOffer());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage can be unavailable (private mode, quota). The cart still
      // works for this page view.
    }
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(OFFER_STORAGE_KEY, selectedOfferId);
    } catch {
      /* see above */
    }
  }, [selectedOfferId, hydrated]);

  // Keep the cart in sync across tabs of the same store.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === CART_STORAGE_KEY) setLines(readStoredLines());
      if (event.key === OFFER_STORAGE_KEY) setSelectedOfferId(readStoredOffer());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const selectOffer = useCallback((offerId: OfferId) => {
    setSelectedOfferId(offerId);
    const offer = getOffer(offerId);
    track({
      name: "offer_select",
      payload: { offerId, priceMinor: offer.priceMinor, currency: currency.code },
    });
  }, []);

  const addLine = useCallback((offerId: OfferId, quantity = 1) => {
    const offer = getOffer(offerId);
    if (!offer.inStock) return;

    setLines((current) => {
      const existing = current.find((line) => line.offerId === offerId);
      const nextQuantity = Math.min(
        (existing?.quantity ?? 0) + quantity,
        maxQuantityPerOffer,
      );
      track({
        name: "add_to_cart",
        payload: {
          offerId,
          quantity,
          valueMinor: offer.priceMinor * quantity,
          currency: currency.code,
        },
      });
      return existing
        ? current.map((line) =>
            line.offerId === offerId ? { ...line, quantity: nextQuantity } : line,
          )
        : [...current, { offerId, quantity: nextQuantity }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((offerId: OfferId, quantity: number) => {
    setLines((current) => {
      if (quantity < 1) return current.filter((line) => line.offerId !== offerId);
      const clamped = Math.min(quantity, maxQuantityPerOffer);
      return current.map((line) =>
        line.offerId === offerId ? { ...line, quantity: clamped } : line,
      );
    });
  }, []);

  const removeLine = useCallback((offerId: OfferId) => {
    setLines((current) => current.filter((line) => line.offerId !== offerId));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { itemCount, subtotalMinor } = useMemo(() => {
    return lines.reduce(
      (totals, line) => {
        const offer = findOffer(line.offerId);
        if (!offer) return totals;
        return {
          itemCount: totals.itemCount + line.quantity,
          subtotalMinor: totals.subtotalMinor + offer.priceMinor * line.quantity,
        };
      },
      { itemCount: 0, subtotalMinor: 0 },
    );
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount,
      subtotalMinor,
      hydrated,
      isOpen,
      selectedOfferId,
      selectOffer,
      addLine,
      setQuantity,
      removeLine,
      clear,
      openCart,
      closeCart,
    }),
    [
      lines,
      itemCount,
      subtotalMinor,
      hydrated,
      isOpen,
      selectedOfferId,
      selectOffer,
      addLine,
      setQuantity,
      removeLine,
      clear,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}
