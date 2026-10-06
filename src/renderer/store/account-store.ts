import { signal } from "../lib/signal";

// Whether the account/settings panel is open. Toggled from the title-bar account
// chip and the native "Settings…" menu item.
export const settingsOpenSignal = signal<boolean>(false);

export const openSettings = (): void => {
  settingsOpenSignal.value = true;
};

export const closeSettings = (): void => {
  settingsOpenSignal.value = false;
};
