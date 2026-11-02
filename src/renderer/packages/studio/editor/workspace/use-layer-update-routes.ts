import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";
import { detachTokensOnEdit } from "../../design-kit/linking/detach-tokens";
import type { LayerUpdateEntry } from "../../panels/multi-select/shared/layer-update-entry";
import type { GestureHistory } from "../use-gesture-history";

interface LayerUpdateRouteInput {
  layers: Layer[];
  gestureHistory: GestureHistory;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
}

export interface LayerUpdateRoutes {
  fromPanel: (id: string, updates: Partial<Layer>) => void;
  manyFromPanel: (entries: LayerUpdateEntry[]) => void;
  fromCanvas: (id: string, updates: Partial<Layer>) => void;
}

export const useLayerUpdateRoutes = ({ layers, gestureHistory, updateLayer }: LayerUpdateRouteInput): LayerUpdateRoutes => {
  const updateDetached = (id: string, updates: Partial<Layer>): void => {
    const current = findLayerById(layers, id);
    updateLayer(id, current ? detachTokensOnEdit(current, updates) : updates);
  };

  const fromPanel = (id: string, updates: Partial<Layer>): void => {
    gestureHistory.recordPanelEdit(id, updates);
    updateDetached(id, updates);
  };

  const manyFromPanel = (entries: LayerUpdateEntry[]): void => {
    if (entries.length === 0) return;
    gestureHistory.recordPanelEdit(entries.map((entry) => entry.id).join("+"), entries[0].updates);
    entries.forEach((entry) => updateDetached(entry.id, entry.updates));
  };

  const fromCanvas = (id: string, updates: Partial<Layer>): void => {
    if ("path" in updates) gestureHistory.recordPanelEdit(id, updates);
    updateDetached(id, updates);
  };

  return { fromPanel, manyFromPanel, fromCanvas };
};
