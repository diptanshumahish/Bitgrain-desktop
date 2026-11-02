import { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import {
  ensurePurchasableBundlesLoaded,
  purchasableBundlesSignal,
} from "../subscription/purchasable-bundles";
import { BUNDLE_PRICES, detectCurrency, EXPORT_PACK_BUNDLE, formatCurrencyAmount } from "@bitgrain/core/format/currency";

interface ExportPackOffer {
  available: boolean;
  price: string;
}

export function useExportPackOffer(): ExportPackOffer {
  const purchasable = useSignalValue(purchasableBundlesSignal);
  useEffect(() => {
    ensurePurchasableBundlesLoaded();
  }, []);
  const currency = detectCurrency();
  return {
    available: purchasable.includes(EXPORT_PACK_BUNDLE),
    price: formatCurrencyAmount(BUNDLE_PRICES[EXPORT_PACK_BUNDLE][currency], currency),
  };
}
