import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { StudioWorkspaceProps } from "../StudioWorkspace";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";
import { detachTokensOnEdit } from "../../design-kit/linking/detach-tokens";
import { refitTextLayer } from "../../layers/text-box/text-box-fit";
import type { GestureHistory } from "../use-gesture-history";

const BACKGROUND_HISTORY_KEY = "__mobile_background__";

interface MobileLayerUpdate {
  updateLayerFromSheet: (id: string, updates: Partial<Layer>) => void;
  setBackgroundFromSheet: (color: string) => void;
}

const prepareUpdates = (layer: Layer, updates: Partial<Layer>, pageWidth: number): Partial<Layer> => {
  const detached = detachTokensOnEdit(layer, updates);
  if (layer.type !== "text") return detached;
  return refitTextLayer(layer, detached as Partial<typeof layer>, pageWidth) as Partial<Layer>;
};

export const useMobileLayerUpdate = (
  props: StudioWorkspaceProps,
  gestureHistory: GestureHistory,
): MobileLayerUpdate => {
  const { layers, canvasW, updateLayer, setBackground } = props;

  const updateLayerFromSheet = (id: string, updates: Partial<Layer>): void => {
    const layer = findLayerById(layers, id);
    if (!layer) return;
    gestureHistory.recordPanelEdit(id, updates);
    updateLayer(id, prepareUpdates(layer, updates, canvasW));
  };

  const setBackgroundFromSheet = (color: string): void => {
    gestureHistory.recordPanelEdit(BACKGROUND_HISTORY_KEY, {});
    setBackground(color);
  };

  return { updateLayerFromSheet, setBackgroundFromSheet };
};
