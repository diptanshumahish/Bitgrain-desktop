import { signal } from "@bitgrain/core/signal";
import type { CopiedLayerStyle } from "../editor/layer-style/extract-layer-style";

export const styleClipboardSignal = signal<CopiedLayerStyle | null>(null);

export function storeCopiedStyle(style: CopiedLayerStyle): void {
  styleClipboardSignal.value = style;
}

export function readCopiedStyle(): CopiedLayerStyle | null {
  return styleClipboardSignal.value;
}
