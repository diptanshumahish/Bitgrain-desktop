import { useEffect, useRef } from "react";
import type { BitgrainEffectKind, Layer } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { findEffectSpec } from "@bitgrain/studio-core/effects/bitgrain/bitgrain-effect-core";
import { onApplyEffect } from "./apply-effect-event";
import { applyEffectToLayers, effectTargetIds } from "./effect-targets";

interface UseApplyEffectCommandArgs {
  layers: Layer[];
  selectedIds: string[];
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  pushHistory: () => void;
}

const explainMissingTarget = (kind: BitgrainEffectKind): void => {
  emitStatusToast({
    title: "Select a photo first",
    detail: `${findEffectSpec(kind)?.label ?? "Effects"} works on images and adjustment layers. Pick one, then try again.`,
  });
};

export const useApplyEffectCommand = (args: UseApplyEffectCommandArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => onApplyEffect((kind) => {
    const { layers, selectedIds, setLayers, pushHistory } = argsRef.current;
    const targetIds = effectTargetIds(layers, selectedIds);
    if (targetIds.length === 0) return explainMissingTarget(kind);
    pushHistory();
    setLayers((prev) => applyEffectToLayers(prev, targetIds, kind));
    trackEvent("studio", "effect_applied_from_palette", { details: { kind, count: targetIds.length } });
  }), []);
};
