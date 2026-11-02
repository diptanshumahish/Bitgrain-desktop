import type { BitgrainEffectKind, Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { defaultParamsFor } from "@bitgrain/studio-core/effects/bitgrain/bitgrain-effect-core";

const EFFECT_LAYER_TYPES: ReadonlySet<Layer["type"]> = new Set(["image", "upload", "adjustment"]);

export const effectTargetIds = (layers: Layer[], selectedIds: string[]): string[] =>
  selectedIds.filter((id) => {
    const layer = findLayerById(layers, id);
    return !!layer && !layer.locked && EFFECT_LAYER_TYPES.has(layer.type);
  });

export const applyEffectToLayers = (layers: Layer[], targetIds: string[], kind: BitgrainEffectKind): Layer[] =>
  updateLayersRecursively(layers, targetIds, () => ({
    bitgrainEffect: { kind, params: defaultParamsFor(kind) },
  }) as Partial<Layer>);
