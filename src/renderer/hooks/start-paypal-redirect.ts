import { callApi } from "../lib/api-client";
import { trackEvent as trackAnalytics } from "../lib/analytics";
import { trackEvent } from "../lib/tracker";
import { rememberPendingOrder } from "../lib/checkout-session";
import type { Coupon } from "./useCoupons";
import type { Bundle, Currency } from "../utils/currency";

export const PAYMENT_TIMEOUT_MS = 30000;

interface PayPalOrderResponse {
  free?: boolean;
  orderId?: string;
  approveUrl?: string;
  plan?: string;
  png?: number;
  svg?: number;
  batch?: number;
}

interface PayPalRedirectInput {
  bundleId: Bundle;
  currency: Currency;
  appliedCoupon: Coupon | null;
  next: string;
}

export interface PayPalRedirectResult {
  status: "redirecting" | "free" | "failed";
  grant?: { png: number; svg: number; plan?: string };
}

// Sends the buyer to PayPal's own hosted page instead of opening the SDK popup. A popup is blocked
// by default on most mobile browsers and cannot survive a refresh, which is why approvals were
// being lost. The order id is stashed first so /checkout/return can capture it on the way back.
export const startPayPalRedirect = async ({
  bundleId,
  currency,
  appliedCoupon,
  next,
}: PayPalRedirectInput): Promise<PayPalRedirectResult> => {
  let data: PayPalOrderResponse | null = null;
  try {
    data = await callApi<PayPalOrderResponse>(
      "/api/create-paypal-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundle: bundleId,
          currency,
          couponId: appliedCoupon?.couponId ?? "",
          couponCode: !appliedCoupon?.couponId ? (appliedCoupon?.code ?? "") : "",
        }),
      },
      PAYMENT_TIMEOUT_MS,
    );
  } catch (error) {
    console.error("PayPal order creation failed", error);
    trackEvent("payment", "order_create_failed", {
      details: { bundle: bundleId, currency, provider: "paypal" },
      immediate: true,
    });
    return { status: "failed" };
  }

  if (data?.free) {
    return {
      status: "free",
      grant: { png: data.png ?? 0, svg: data.svg ?? 0, plan: data.plan },
    };
  }

  if (!data?.orderId || !data.approveUrl) {
    trackEvent("payment", "order_create_failed", {
      details: { bundle: bundleId, currency, provider: "paypal", reason: "no_approve_link" },
      immediate: true,
    });
    return { status: "failed" };
  }

  rememberPendingOrder({ orderId: data.orderId, currency, next });
  trackAnalytics("checkout_started", { sku: bundleId, plan: "pro", provider: "paypal", currency });
  window.location.assign(data.approveUrl);
  return { status: "redirecting" };
};
