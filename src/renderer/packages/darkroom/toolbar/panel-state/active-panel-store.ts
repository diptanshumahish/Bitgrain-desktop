import { signal } from "@bitgrain/core/signal";
import { isMobileNow } from "@bitgrain/ui/hooks/use-is-mobile";
import type { ActivePopover } from "../toolbar-types";

export const activePanelSignal = signal<ActivePopover>(null);
export const mobileEffectsSheetSignal = signal(false);

export const openEffectsPicker = (): void => {
  if (isMobileNow()) {
    activePanelSignal.value = null;
    mobileEffectsSheetSignal.value = true;
    return;
  }
  activePanelSignal.value = "effects";
};
