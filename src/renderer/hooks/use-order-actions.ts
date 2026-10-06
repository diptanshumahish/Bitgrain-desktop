import { useCallback } from "react";
import { callApi } from "../lib/api-client";
import posthog, { trackEvent as trackAnalytics } from "../lib/analytics";
import type { Coupon } from "./useCoupons";
import type { Bundle, Currency } from "../utils/currency";
import { supportsPayPal } from "../lib/paypal-loader";
import { emitModal } from "../lib/event-bus";
import { trackEvent } from "../lib/tracker";
import { userSignal } from "./useAuth";
import type { UserCredits } from "./useUser";
import { bundleDescription, openRazorpayOrder } from "./payment-helpers";
import { startPayPalRedirect } from "./start-paypal-redirect";
import { SUPPORT_EMAIL } from "../pages/legal/legal-constants";

interface CreditsLike {
  png: number;
  svg: number;
}

// Payment calls proxy to Razorpay, which regularly takes longer than the default 4s API timeout.
// Timing out here would show a failure to someone whose card was charged.
const PAYMENT_TIMEOUT_MS = 30000;

// reportOrderFailure replaces an older "fall back to manual checkout" path that opened Razorpay
// with no order id. That took real money for which no payments row existed, so nothing could ever
// be granted against it. Failing loudly is the only safe behaviour here.
const reportOrderFailure = (bundleId: Bundle, currency: Currency): void => {
  trackEvent("payment", "order_create_failed", {
    details: { bundle: bundleId, currency },
    immediate: true,
  });
  if (!userSignal.value) {
    emitModal({ type: "login", reason: "purchase" });
    return;
  }
  emitModal({
    type: "confirm",
    title: "couldn't start checkout",
    message:
      `we could not create your order, so nothing was charged. please try again in a moment, and email ${SUPPORT_EMAIL} if it keeps happening.`,
    confirmLabel: "ok",
    onConfirm: () => {},
  });
};

type UpdateCredits = (
  png: number,
  svg: number,
  plan?: UserCredits["plan"],
  batchPng?: number,
  batchSvg?: number,
  planExpiresAt?: number,
) => void;

interface OrderActionsConfig {
  credits: CreditsLike | null | undefined;
  updateCredits: UpdateCredits;
  syncServerCredits: () => Promise<void>;
}

export interface OrderActions {
  triggerLegacyOrder: (
    bundleId: Bundle,
    appliedCoupon: Coupon | null,
    currency: Currency,
    onSuccess: () => void,
  ) => void;
}

export const useOrderActions = ({
  credits,
  updateCredits,
  syncServerCredits,
}: OrderActionsConfig): OrderActions => {
  const triggerLegacyOrder = useCallback<OrderActions["triggerLegacyOrder"]>(
    (bundleId, appliedCoupon, currency, onSuccess) => {
      if (currency !== "INR" && supportsPayPal(currency)) {
        void startPayPalRedirect({
          bundleId,
          currency,
          appliedCoupon,
          next: window.location.pathname + window.location.search,
        }).then((result) => {
          if (result.status === "free") {
            updateCredits(
              (credits?.png ?? 0) + (result.grant?.png ?? 0),
              (credits?.svg ?? 0) + (result.grant?.svg ?? 0),
              result.grant?.plan as UserCredits["plan"],
            );
            onSuccess();
            return;
          }
          if (result.status === "failed") reportOrderFailure(bundleId, currency);
        });
        return;
      }

      const openCheckout = (orderId: string, amount: number, keyId: string) => {
        openRazorpayOrder({
          keyId,
          amount,
          currency,
          description: bundleDescription(bundleId, appliedCoupon),
          orderId,
          onPayment: async (response) => {
            if (!response.razorpay_payment_id) return;
            posthog.capture("bundle_purchased", {
              bundle_id: bundleId,
              currency,
              amount: amount / 100,
              coupon_applied: appliedCoupon?.code ?? null,
              discount_percent: appliedCoupon?.discountPercent ?? 0,
            });
            try {
              await callApi(
                "/api/payments/verify",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: response.razorpay_order_id || orderId,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                  }),
                },
                PAYMENT_TIMEOUT_MS,
              );
              trackAnalytics("payment_succeeded", { sku: bundleId, plan: "pro" });
              await syncServerCredits();
            } catch (e) {
              console.error("Verification failed, falling back to polling", e);
              setTimeout(() => syncServerCredits(), 2000);
              setTimeout(() => syncServerCredits(), 6000);
            }
            onSuccess();
          },
        }).catch((error) => {
          console.error("Razorpay order failed to open", error);
        });
      };

      callApi<{
        free?: boolean;
        orderId?: string;
        amount: number;
        currency?: string;
        keyId?: string;
        png?: number;
        svg?: number;
        batch?: number;
        plan?: string;
      }>(
        "/api/create-order",
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
      ).then((data) => {
        if (data?.free) {
          updateCredits(
            (credits?.png ?? 0) + (data.png ?? 0),
            (credits?.svg ?? 0) + (data.svg ?? 0),
            data.plan as UserCredits["plan"],
          );
          onSuccess();
          return;
        }
        if (data?.orderId && data.keyId) {
          trackAnalytics("checkout_started", {
            sku: bundleId,
            plan: data.plan ?? "pro",
            provider: "razorpay",
            currency,
          });
          openCheckout(data.orderId, data.amount, data.keyId);
          return;
        }
        reportOrderFailure(bundleId, currency);
      }).catch((error) => {
        console.error("Order creation request failed", error);
        reportOrderFailure(bundleId, currency);
      });
    },
    [credits, syncServerCredits, updateCredits],
  );

  return { triggerLegacyOrder };
};
