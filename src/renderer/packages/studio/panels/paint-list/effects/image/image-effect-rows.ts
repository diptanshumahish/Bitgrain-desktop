import type { LayerShadow, TornEdgeEffect } from "@bitgrain/studio-core/model/studio-types";
import type { LayerEffect, LayerEffectKind } from "@bitgrain/studio-core/model/layer-paint-types";

type ImageSlotKind = "shadow" | "glow" | "edge";
type ImageListKind = Extract<LayerEffectKind, "inner-shadow" | "layer-blur" | "background-blur">;
export type ImageEffectKind = ImageSlotKind | ImageListKind;

export interface ImageEffectFields {
  shadow?: LayerShadow;
  tornEdge?: TornEdgeEffect;
  layerEffects?: LayerEffect[];
}

export type ImageEffectRow = { slot: "shadow" } | { slot: "edge" } | { slot: "list"; index: number };

interface ImageEffectOption {
  label: string;
  value: ImageEffectKind;
}

const SLOT_OPTIONS: Record<ImageSlotKind, ImageEffectOption> = {
  shadow: { label: "Shadow", value: "shadow" },
  glow: { label: "Glow", value: "glow" },
  edge: { label: "Edge & frame", value: "edge" },
};

const LIST_OPTIONS: ImageEffectOption[] = [
  { label: "Inner shadow", value: "inner-shadow" },
  { label: "Blur", value: "layer-blur" },
  { label: "Blur behind", value: "background-blur" },
];

export const isListKind = (kind: ImageEffectKind): kind is ImageListKind => LIST_OPTIONS.some((option) => option.value === kind);

export const imageEffectRows = (fields: ImageEffectFields): ImageEffectRow[] => [
  ...(fields.shadow ? [{ slot: "shadow" } as const] : []),
  ...(fields.layerEffects ?? []).map((_, index) => ({ slot: "list", index }) as const).reverse(),
  ...(fields.tornEdge ? [{ slot: "edge" } as const] : []),
];

export const rowKind = (row: ImageEffectRow, fields: ImageEffectFields): ImageEffectKind => {
  if (row.slot === "edge") return "edge";
  if (row.slot === "shadow") return fields.shadow?.mode === "glow" ? "glow" : "shadow";
  return (fields.layerEffects?.[row.index]?.kind ?? "inner-shadow") as ImageListKind;
};

export const imageEffectOptions = (fields: ImageEffectFields, supportsEdge: boolean, row?: ImageEffectRow): ImageEffectOption[] => {
  const shadowFree = !fields.shadow || row?.slot === "shadow";
  const edgeFree = supportsEdge && (!fields.tornEdge || row?.slot === "edge");
  return [
    ...(shadowFree ? [SLOT_OPTIONS.shadow, SLOT_OPTIONS.glow] : []),
    ...LIST_OPTIONS,
    ...(edgeFree ? [SLOT_OPTIONS.edge] : []),
  ];
};

export const isRowVisible = (row: ImageEffectRow, fields: ImageEffectFields): boolean => {
  if (row.slot === "edge") return !fields.tornEdge?.hidden;
  if (row.slot === "shadow") return Boolean(fields.shadow?.enabled);
  return fields.layerEffects?.[row.index]?.visible ?? false;
};
