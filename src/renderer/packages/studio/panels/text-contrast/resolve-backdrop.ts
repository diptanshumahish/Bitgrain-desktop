import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { Rect } from "@bitgrain/studio-core/layers/frame-tree";
import { locateNode } from "@bitgrain/studio-core/layers/frame-tree";
import { normalizeHex } from "../../ui/color-picker/collect-document-colors";
import { containsPoint, flattenPaintOrder, layersBelow } from "./paint-order";

const HALF = 2;
const OPAQUE_HEX_LENGTH = 7;
const FULL_OPACITY = 1;

export type BackdropSource = "page" | "shape" | "frame";

export type Backdrop =
  | { kind: "solid"; color: string; source: BackdropSource }
  | { kind: "image"; page: TemplatePage; layers: Layer[]; rect: Rect; key: string };

type Classified = Backdrop | "skip" | "sample";

const opaqueHex = (color: string | undefined): string | null => {
  const normalized = normalizeHex(color);
  return normalized && normalized.length === OPAQUE_HEX_LENGTH ? normalized : null;
};

const TRANSPARENT_HEX8 = /^#[0-9a-f]{6}00$/i;

const isClear = (color: string | undefined): boolean =>
  !color || color === "transparent" || TRANSPARENT_HEX8.test(color);

const classifySolid = (color: string, source: BackdropSource, opacity: number): Classified => {
  if (isClear(color)) return "skip";
  const solid = opaqueHex(color);
  return solid && opacity >= FULL_OPACITY ? { kind: "solid", color: solid, source } : "sample";
};

const classifyLayer = (layer: Layer): Classified => {
  if (layer.type === "text" || layer.type === "group") return "skip";
  if (layer.type === "shape") return classifySolid(layer.fill, "shape", layer.opacity);
  if (layer.type === "frame") return layer.image ? "sample" : classifySolid(layer.background, "frame", layer.opacity);
  return "sample";
};

const fingerprint = (page: TemplatePage, layers: Layer[], rect: Rect): string =>
  [
    page.id,
    page.background,
    page.image?.length ?? 0,
    rect.x, rect.y, rect.width, rect.height,
    ...flattenPaintOrder(layers).map(({ layer, rect: box }) =>
      [layer.id, box.x, box.y, box.width, box.height, layer.opacity, layer.visible, JSON.stringify(layer).length].join(":"),
    ),
  ].join("|");

const imageBackdrop = (page: TemplatePage, textId: string, rect: Rect): Backdrop => {
  const below = layersBelow(page.layers, textId).layers;
  return { kind: "image", page, layers: below, rect, key: fingerprint(page, below, rect) };
};

export const resolveBackdrop = (pages: TemplatePage[], textId: string): Backdrop | null => {
  const page = locateNode(pages, textId)?.page;
  if (!page) return null;
  const entries = flattenPaintOrder(page.layers);
  const index = entries.findIndex((entry) => entry.layer.id === textId);
  if (index < 0) return null;
  const rect = entries[index].rect;
  const centerX = rect.x + rect.width / HALF;
  const centerY = rect.y + rect.height / HALF;
  for (let position = index - 1; position >= 0; position -= 1) {
    const { layer, rect: box } = entries[position];
    if (!layer.visible || layer.opacity <= 0 || !containsPoint(box, centerX, centerY)) continue;
    const classified = classifyLayer(layer);
    if (classified === "skip") continue;
    return classified === "sample" ? imageBackdrop(page, textId, rect) : classified;
  }
  const pageSolid = page.image ? null : opaqueHex(page.background);
  return pageSolid ? { kind: "solid", color: pageSolid, source: "page" } : imageBackdrop(page, textId, rect);
};
