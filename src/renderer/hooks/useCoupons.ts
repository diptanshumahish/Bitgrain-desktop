import { useState, useCallback } from "react";
import { callApi } from "../lib/api-client";

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
  expiryDate?: number;
  usageCount: number;
  couponId?: string;
}

const getLocalCoupons = (): Coupon[] => {
  const raw = import.meta.env.VITE_COUPONS;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const LOCAL_COUPONS = getLocalCoupons();

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => [...LOCAL_COUPONS]);

  const validateCoupon = useCallback(async (code: string): Promise<Coupon | null> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return null;

    const result = await callApi<{ valid: boolean; discountPct: number; couponId: string }>(
      "/api/coupons/validate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      }
    );

    if (result?.valid) {
      return {
        code: trimmed,
        discountPercent: result.discountPct,
        description: `${result.discountPct}% off`,
        usageCount: 0,
        couponId: result.couponId,
      };
    }

    // fallback: check local env coupons (safe for dev)
    const local = coupons.find((c) => c.code === trimmed);
    if (local) {
      if (local.expiryDate && local.expiryDate < Date.now()) return null;
      return local;
    }

    return null;
  }, [coupons]);

  const incrementUsage = useCallback((code: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.code === code.toUpperCase() ? { ...c, usageCount: c.usageCount + 1 } : c
      )
    );
  }, []);

  return { coupons, validateCoupon, incrementUsage };
};
