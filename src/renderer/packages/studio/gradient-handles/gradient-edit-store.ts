import { signal } from "@bitgrain/core/signal";
import type { PaintGradient } from "@bitgrain/studio-core/model/paint-types";

interface GradientEditTarget {
  layerId: string;
  apply: (gradient: PaintGradient) => void;
}

export const gradientEditSignal = signal<GradientEditTarget | null>(null);

export const startGradientEdit = (target: GradientEditTarget): void => {
  gradientEditSignal.value = target;
};

export const stopGradientEdit = (layerId: string): void => {
  if (gradientEditSignal.value?.layerId === layerId) gradientEditSignal.value = null;
};
