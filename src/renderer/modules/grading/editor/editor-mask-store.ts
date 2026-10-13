import { signal } from "../../../lib/signal";
import { imageSignal } from "../../../store/image-store";
import type { MaskLayer } from "../mask/mask-types";

export const masksSignal = signal<MaskLayer[]>([]);
export const selectedMaskIdSignal = signal<string | null>(null);
export const maskOverlaySignal = signal(true);

const dropBrushesForNewImage = (): void => {
  if (!masksSignal.value.some((mask) => mask.area.brush !== null)) return;
  masksSignal.value = masksSignal.value.map((mask) => ({ ...mask, area: { ...mask.area, brush: null } }));
};

imageSignal.subscribe(dropBrushesForNewImage);
