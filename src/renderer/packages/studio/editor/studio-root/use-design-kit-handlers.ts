import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { TextStyleVariable, NumberToken } from "@bitgrain/studio-core/model/design-kit-types";
import { loadDesignKits, updateColor, trackKit } from "../../state/design-kits-store";
import {
  colorBindUpdateForLayer,
  textStyleBindUpdate,
  numberUpdateForLayer,
  resyncVarInPages,
} from "../../design-kit/apply-design-kit";
import { useKitTokenResync } from "../../design-kit/linking/use-kit-token-resync";
import { useBrandFix } from "../../design-kit/brand-check/use-brand-fix";
import { useKitAutoApply } from "../../design-kit/auto-apply/use-kit-auto-apply";
import { refitTextLayer } from "../../layers/text-box/text-box-fit";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";

interface UseDesignKitHandlersArgs {
  pages: TemplatePage[];
  layers: Layer[];
  selectedIds: string[];
  setPages: (pages: TemplatePage[]) => void;
  bindPageBackground: (pageId: string, background: string, backgroundVar?: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  pushHistory: () => void;
  autoApplyEnabled: boolean;
  applyKitOnOpen: boolean;
}

interface DesignKitHandlers {
  handleApplyKitColor: (varId: string, hex: string) => void;
  handleApplyKitTextStyle: (style: TextStyleVariable) => void;
  handleApplyKitNumber: (token: NumberToken) => void;
  handleVariableColorChange: (varId: string, hex: string) => void;
  handlePageBackgroundBind: (pageId: string, varId: string, value: string) => void;
}

type LayerUpdateBuilder = (layer: Layer) => Partial<Layer> | null;

const textStyleUpdate = (style: TextStyleVariable): LayerUpdateBuilder => (layer) =>
  layer.type === "text" ? refitTextLayer(layer, textStyleBindUpdate(layer, style)) : null;

export const useDesignKitHandlers = (args: UseDesignKitHandlersArgs): DesignKitHandlers => {
  const { pages, setPages, pushHistory, autoApplyEnabled, applyKitOnOpen } = args;
  const latestRef = useRef(args);
  useEffect(() => {
    latestRef.current = args;
  });

  useEffect(() => {
    loadDesignKits();
  }, []);
  useKitTokenResync({ pages, setPages, pushHistory });
  useBrandFix({ pages, setPages, pushHistory });
  useKitAutoApply({ pages, setPages, pushHistory, enabled: autoApplyEnabled, applyOnOpen: applyKitOnOpen });

  const applyToSelection = useCallback((buildUpdate: LayerUpdateBuilder): void => {
    const { selectedIds, layers, updateLayer, pushHistory: recordHistory } = latestRef.current;
    if (selectedIds.length === 0) return;
    recordHistory();
    for (const id of selectedIds) {
      const layer = findLayerById(layers, id);
      const update = layer ? buildUpdate(layer) : null;
      if (update) updateLayer(id, update);
    }
  }, []);

  const applyKitToken = useCallback(
    (details: Record<string, string>, buildUpdate: LayerUpdateBuilder): void => {
      if (latestRef.current.selectedIds.length === 0) return;
      trackKit("kit_applied", details);
      applyToSelection(buildUpdate);
    },
    [applyToSelection],
  );

  return useMemo(() => ({
    handleApplyKitColor: (varId: string, hex: string): void =>
      applyKitToken({ token: "color" }, (layer) => colorBindUpdateForLayer(layer, varId, hex)),
    handleApplyKitTextStyle: (style: TextStyleVariable): void =>
      applyKitToken({ token: "text_style" }, textStyleUpdate(style)),
    handleApplyKitNumber: (token: NumberToken): void =>
      applyKitToken({ token: "number", kind: token.kind }, (layer) => numberUpdateForLayer(layer, token)),
    handleVariableColorChange: (varId: string, hex: string): void => {
      latestRef.current.pushHistory();
      updateColor(varId, { value: hex });
      latestRef.current.setPages(resyncVarInPages(latestRef.current.pages, varId, hex));
    },
    handlePageBackgroundBind: (pageId: string, varId: string, value: string): void => {
      latestRef.current.pushHistory();
      latestRef.current.bindPageBackground(pageId, value, varId);
    },
  }), [applyKitToken]);
};
