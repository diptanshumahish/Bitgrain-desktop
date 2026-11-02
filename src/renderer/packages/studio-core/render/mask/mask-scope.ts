import type { Layer } from "../../model/studio-types";
import type { MaskRunEntry } from "../../mask/mask-runs";
import { maskRenderLayer } from "../../mask/mask-source-layer";

export interface MaskScopeItem {
  type: "mask-scope";
  id: string;
  visible: true;
  mask: Layer;
  members: FlatItem[];
}

export type FlatItem = Layer | MaskScopeItem;

export const isMaskScope = (item: FlatItem): item is MaskScopeItem => item.type === "mask-scope";

export const mapFlatLayers = (items: FlatItem[], transform: (layer: Layer) => Layer): FlatItem[] =>
  items.map((item) =>
    isMaskScope(item)
      ? { ...item, mask: transform(item.mask), members: mapFlatLayers(item.members, transform) }
      : transform(item),
  );

export const buildMaskScope = (entry: MaskRunEntry<Layer>, flatten: (layers: Layer[]) => FlatItem[]): MaskScopeItem | null => {
  const mask = flatten([maskRenderLayer(entry.mask.layer)])[0];
  if (!mask || isMaskScope(mask)) return null;
  return {
    type: "mask-scope",
    id: `${entry.mask.layer.id}-scope`,
    visible: true,
    mask,
    members: flatten(entry.members.map((slot) => slot.layer)),
  };
};
