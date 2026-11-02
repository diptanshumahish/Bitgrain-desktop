import { signal } from "../lib/signal";
import type { Layer } from "../data/studioTypes";
import { cloneLayersWithFreshIds } from "../data/templates/template-pages";

const CLIPBOARD_MARKER_PREFIX = "bitgrain-layers:";
const PASTE_OFFSET_PX = 16;

interface LayerClipboard {
  layers: Layer[];
  marker: string;
  pasteCount: number;
}

export const layerClipboardSignal = signal<LayerClipboard | null>(null);

export function storeCopiedLayers(layers: Layer[]): string {
  const marker = `${CLIPBOARD_MARKER_PREFIX}${crypto.randomUUID()}`;
  layerClipboardSignal.value = { layers: structuredClone(layers), marker, pasteCount: 0 };
  return marker;
}

export function isCopiedLayersMarker(text: string): boolean {
  return text !== "" && layerClipboardSignal.value?.marker === text;
}

export function takePastedLayers(): Layer[] {
  const clipboard = layerClipboardSignal.value;
  if (!clipboard) return [];
  const pasteCount = clipboard.pasteCount + 1;
  layerClipboardSignal.value = { ...clipboard, pasteCount };
  const offset = PASTE_OFFSET_PX * pasteCount;
  return cloneLayersWithFreshIds(clipboard.layers).map((layer) => ({
    ...layer,
    x: layer.x + offset,
    y: layer.y + offset,
  }));
}
