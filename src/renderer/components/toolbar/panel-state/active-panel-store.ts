import { signal } from "../../../lib/signal";
import { isMobileNow } from "../../../hooks/useIsMobile";
import type { ActivePopover } from "../DesktopToolbar";

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
