import { useCallback } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { trackEvent } from "@bitgrain/platform/tracker";
import { readCopiedStyle, storeCopiedStyle } from "../../state/style-clipboard-store";
import { extractLayerStyle } from "./extract-layer-style";
import { styleUpdatesFor } from "./apply-layer-style";
import { unlockedLayerIds } from "../selection-ops";

interface UseStyleClipboardArgs {
  layers: Layer[];
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  pushHistory: () => void;
}

export interface StyleClipboardHandlers {
  handleCopyStyle: (ids: string[]) => void;
  handlePasteStyle: (ids: string[]) => void;
}

export const useStyleClipboard = ({ layers, setLayers, pushHistory }: UseStyleClipboardArgs): StyleClipboardHandlers => {
  const handleCopyStyle = useCallback((ids: string[]): void => {
    const source = ids.length > 0 ? findLayerById(layers, ids[0]) : null;
    if (!source) return;
    storeCopiedStyle(extractLayerStyle(source));
    trackEvent("studio", "style_copied", { details: { type: source.type } });
  }, [layers]);

  const handlePasteStyle = useCallback((ids: string[]): void => {
    const copied = readCopiedStyle();
    const targetIds = unlockedLayerIds(layers, ids);
    if (!copied || targetIds.length === 0) return;
    pushHistory();
    trackEvent("studio", "style_pasted", { details: { count: targetIds.length } });
    setLayers((prev) => updateLayersRecursively(prev, targetIds, (layer) => styleUpdatesFor(copied, layer)));
  }, [layers, pushHistory, setLayers]);

  return { handleCopyStyle, handlePasteStyle };
};
