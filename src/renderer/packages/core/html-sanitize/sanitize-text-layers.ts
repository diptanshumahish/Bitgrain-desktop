import { sanitizeRichHtml } from "./sanitize-rich-html";

const TEXT_LAYER_TYPE = "text";

type LayerRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is LayerRecord => typeof value === "object" && value !== null;

const sanitizeTextFields = (layer: LayerRecord): LayerRecord => {
  if (layer.richContent === undefined) return layer;
  const richContent = typeof layer.richContent === "string" ? sanitizeRichHtml(layer.richContent) : undefined;
  return { ...layer, richContent };
};

const sanitizeLayer = (layer: unknown): unknown => {
  if (!isRecord(layer)) return layer;
  if (Array.isArray(layer.layers)) return { ...layer, layers: sanitizeLayerTree(layer.layers) };
  return layer.type === TEXT_LAYER_TYPE ? sanitizeTextFields(layer) : layer;
};

export function sanitizeLayerTree<T>(layers: T[]): T[] {
  return layers.map((layer) => sanitizeLayer(layer) as T);
}
