import { callApi } from "@bitgrain/api/api-client";

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  expiryDate?: number;
  usageCount: number;
  couponId?: string;
}

interface CouponValidation {
  valid: boolean;
  discountPct: number;
  couponId: string;
}

const validateCoupon = async (code: string): Promise<Coupon | null> => {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return null;
  const result = await callApi<CouponValidation>("/api/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: trimmed }),
  });
  if (!result?.valid) return null;
  return {
    code: trimmed,
    discountPercent: result.discountPct,
    description: `${result.discountPct}% off`,
    usageCount: 0,
    couponId: result.couponId,
  };
};

export const useCoupons = (): { validateCoupon: (code: string) => Promise<Coupon | null> } => ({ validateCoupon });
