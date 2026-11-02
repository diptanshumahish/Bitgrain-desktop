import { signal } from "@bitgrain/core/signal";
import { trackEvent } from "@bitgrain/platform/tracker";

export const paletteOpenSignal = signal(false);
export const paletteQuerySignal = signal("");
export const paletteActiveIndexSignal = signal(0);

export const openPalette = (source: string): void => {
  if (paletteOpenSignal.value) return;
  trackEvent("studio", "palette_opened", { details: { source } });
  paletteQuerySignal.value = "";
  paletteActiveIndexSignal.value = 0;
  paletteOpenSignal.value = true;
};

export const closePalette = (): void => {
  paletteOpenSignal.value = false;
};

export const setPaletteQuery = (query: string): void => {
  paletteQuerySignal.value = query;
  paletteActiveIndexSignal.value = 0;
};

export const moveActiveIndex = (step: number, total: number): void => {
  if (total === 0) return;
  paletteActiveIndexSignal.value = (paletteActiveIndexSignal.value + step + total) % total;
};
