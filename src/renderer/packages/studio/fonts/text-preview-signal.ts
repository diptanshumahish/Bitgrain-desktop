import { signal } from "@bitgrain/core/signal";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";

export type TextPreviewPatch = Partial<Pick<TextLayer, "fontFamily" | "fontWeight">>;

interface TextPreview {
  layerId: string;
  patch: TextPreviewPatch;
}

export const textPreviewSignal = signal<TextPreview | null>(null);

export const previewTextLayer = (layerId: string, patch: TextPreviewPatch | null): void => {
  textPreviewSignal.value = patch ? { layerId, patch } : null;
};

export const withTextPreview = (layer: TextLayer, preview: TextPreview | null): TextLayer =>
  preview && preview.layerId === layer.id ? { ...layer, ...preview.patch } : layer;
