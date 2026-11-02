import { useEffect } from "react";
import { signal, useSignalValue } from "@bitgrain/core/signal";
import { callApi } from "@bitgrain/api/api-client";
import { ANNUAL_BUNDLE, type BillingCycle } from "@bitgrain/core/format/currency";
import { proIncludesProductsSignal } from "./pro-includes-products-state";

interface PublicPricesResponse {
  purchasable?: string[];
  proIncludesProducts?: boolean;
}

const CYCLES_WITH_ANNUAL: BillingCycle[] = ["monthly", "annual", "lifetime"];
const CYCLES_WITHOUT_ANNUAL: BillingCycle[] = ["monthly", "lifetime"];

export const purchasableBundlesSignal = signal<string[]>([]);

let requested = false;

const loadPurchasableBundles = async (): Promise<void> => {
  const data = await callApi<PublicPricesResponse>("/api/prices");
  if (data?.purchasable) purchasableBundlesSignal.value = data.purchasable;
  proIncludesProductsSignal.value = data?.proIncludesProducts === true;
};

export const ensurePurchasableBundlesLoaded = (): void => {
  if (requested) return;
  requested = true;
  void loadPurchasableBundles();
};

const visibleBillingCycles = (purchasable: string[]): BillingCycle[] =>
  purchasable.includes(ANNUAL_BUNDLE) ? CYCLES_WITH_ANNUAL : CYCLES_WITHOUT_ANNUAL;

export const useVisibleBillingCycles = (): BillingCycle[] => {
  const purchasable = useSignalValue(purchasableBundlesSignal);
  useEffect(() => {
    ensurePurchasableBundlesLoaded();
  }, []);
  return visibleBillingCycles(purchasable);
};
