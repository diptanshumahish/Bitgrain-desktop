import { callApi } from "../lib/api-client";
import { trackEvent as trackAnalytics } from "../lib/analytics";
import { trackEvent } from "../lib/tracker";
import { rememberPendingOrder } from "../lib/checkout-session";
import type { Coupon } from "./useCoupons";
import type { Bundle, Currency } from "../utils/currency";

export const PAYMENT_TIMEOUT_MS = 30000;

interface DodoOneTimeResponse {
  free?: boolean;
  paymentId?: string;
  paymentLink?: string;
  plan?: string;
  png?: number;
  svg?: number;
  batch?: number;
}

interface DodoSubscriptionResponse {
  subscriptionId?: string;
  paymentLink?: string;
  amount?: number;
  currency?: string;
  cycle?: string;
}

interface DodoRedirectInput {
  bundleId: Bundle;
  currency: Currency;
  appliedCoupon: Coupon | null;
  next: string;
}

export interface DodoRedirectResult {
  status: "redirecting" | "free" | "failed";
  grant?: { png: number; svg: number; plan?: string };
}

export const startDodoOneTime = async ({
  bundleId,
  currency,
  appliedCoupon,
  next,
}: DodoRedirectInput): Promise<DodoRedirectResult> => {
  let data: DodoOneTimeResponse | null = null;
  try {
    data = await callApi<DodoOneTimeResponse>(
      "/api/create-dodo-payment",
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
    console.error("Dodo payment creation failed", error);
    trackEvent("payment", "order_create_failed", {
      details: { bundle: bundleId, currency, provider: "dodo" },
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

  if (!data?.paymentId || !data.paymentLink) {
    trackEvent("payment", "order_create_failed", {
      details: { bundle: bundleId, currency, provider: "dodo", reason: "no_payment_link" },
      immediate: true,
    });
    return { status: "failed" };
  }

  rememberPendingOrder({ paymentId: data.paymentId, currency, next, kind: "one_time" });
  trackAnalytics("checkout_started", { sku: bundleId, plan: "pro", provider: "dodo", currency });
  window.location.assign(data.paymentLink);
  return { status: "redirecting" };
};

export const startDodoSubscription = async ({
  bundleId,
  currency,
  next,
}: Omit<DodoRedirectInput, "appliedCoupon">): Promise<DodoRedirectResult> => {
  let data: DodoSubscriptionResponse | null = null;
  try {
    data = await callApi<DodoSubscriptionResponse>(
      "/api/create-dodo-subscription",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundle: bundleId, currency }),
      },
      PAYMENT_TIMEOUT_MS,
    );
  } catch (error) {
    console.error("Dodo subscription creation failed", error);
    trackEvent("payment", "order_create_failed", {
      details: { bundle: bundleId, currency, provider: "dodo", mode: "subscription" },
      immediate: true,
    });
    return { status: "failed" };
  }

  if (!data?.subscriptionId || !data.paymentLink) {
    trackEvent("payment", "order_create_failed", {
      details: { bundle: bundleId, currency, provider: "dodo", mode: "subscription", reason: "no_payment_link" },
      immediate: true,
    });
    return { status: "failed" };
  }

  rememberPendingOrder({ subscriptionId: data.subscriptionId, currency, next, kind: "subscription" });
  trackAnalytics("checkout_started", { sku: bundleId, plan: "pro", provider: "dodo", currency, mode: "subscription" });
  window.location.assign(data.paymentLink);
  return { status: "redirecting" };
};
