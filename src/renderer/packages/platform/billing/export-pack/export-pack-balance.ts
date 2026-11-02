import { useSignalValue } from "@bitgrain/core/signal";
import { accountCreditsSignal } from "../../account/user-credits-store";
import { storeAccountCredits } from "../../account/load-account-credits";

export const exportPackBalance = (): number => accountCreditsSignal.value?.exportPack ?? 0;

export const useExportPackBalance = (): number => useSignalValue(accountCreditsSignal)?.exportPack ?? 0;

export function storeExportPackBalance(remaining: number): void {
  const credits = accountCreditsSignal.value;
  if (!credits) return;
  storeAccountCredits({ ...credits, exportPack: remaining });
}
