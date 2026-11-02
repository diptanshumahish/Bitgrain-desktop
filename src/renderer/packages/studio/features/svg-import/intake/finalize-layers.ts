import type { Layer, TextLayer, UploadLayer } from "@bitgrain/studio-core/model/studio-types";
import { refitTextLayer } from "../../../layers/text-box/text-box-fit";
import { sizingPatch } from "@bitgrain/studio-core/text/layout/text-sizing";
import { uploadTemplateAsset } from "@bitgrain/platform/templates/template-assets";
import type { TextMeasurer } from "../build/build-text";

const DATA_IMAGE_PREFIX = "data:image/";

const measureCache: { context: CanvasRenderingContext2D | null } = { context: null };

export const canvasMeasurer: TextMeasurer = (text, font) => {
  measureCache.context = measureCache.context ?? document.createElement("canvas").getContext("2d");
  if (!measureCache.context) return 0;
  measureCache.context.font = font;
  return measureCache.context.measureText(text).width;
};

const refitText = (layer: TextLayer, pageWidth: number): TextLayer => ({
  ...layer,
  ...refitTextLayer(layer, sizingPatch("auto-width"), pageWidth),
});

const uploadImage = async (layer: UploadLayer): Promise<UploadLayer> => {
  if (!layer.src?.startsWith(DATA_IMAGE_PREFIX)) return layer;
  const uploaded = await uploadTemplateAsset(layer.src, `${layer.name || "svg-image"}.png`).catch(() => null);
  return uploaded ? { ...layer, src: uploaded } : layer;
};

export const finalizeImportedLayer = async (layer: Layer, pageWidth: number): Promise<Layer> => {
  if (layer.type === "text") return refitText(layer, pageWidth);
  if (layer.type === "upload") return uploadImage(layer);
  if (layer.type !== "group") return layer;
  const children = await Promise.all(layer.layers.map((child) => finalizeImportedLayer(child, pageWidth)));
  return { ...layer, layers: children };
};
