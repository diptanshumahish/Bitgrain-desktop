import type { Currency } from "../utils/currency";

export const CHECKOUT_PATH = "/checkout";

const PENDING_ORDER_KEY = "bg:checkout:pending";

// Carries context across the Dodo-hosted checkout redirect so the return leg can finalise the
// right payment (one-time vs subscription) and send the buyer back to the editor or studio they
// were in rather than dropping them on the landing page.
export interface PendingOrder {
  kind: "one_time" | "subscription";
  paymentId?: string;
  subscriptionId?: string;
  currency: Currency;
  next: string;
}

export const rememberPendingOrder = (order: PendingOrder): void => {
  sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
};

export const readPendingOrder = (): PendingOrder | null => {
  const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingOrder;
  } catch {
    return null;
  }
};

export const clearPendingOrder = (): void => {
  sessionStorage.removeItem(PENDING_ORDER_KEY);
};

export const buildCheckoutPath = (next: string): string => {
  if (!next || next === "/" || next.startsWith(CHECKOUT_PATH)) return CHECKOUT_PATH;
  return `${CHECKOUT_PATH}?next=${encodeURIComponent(next)}`;
};
