import { signal } from "@bitgrain/core/signal";
import type { GuideAxis } from "@bitgrain/studio-core/model/layout-grid-types";

interface RulerDragPreview {
  axis: GuideAxis;
  screen: number;
}

export const rulerDragPreviewSignal = signal<RulerDragPreview | null>(null);
