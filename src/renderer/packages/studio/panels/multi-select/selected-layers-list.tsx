import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../ui/panel-group";
import { LayerPickList } from "../../ui/layer-pick-list";
import { emitSelectLayers } from "../../editor/select-layers-event";

interface SelectedLayersListProps {
  layers: Layer[];
}

export const SelectedLayersList: React.FC<SelectedLayersListProps> = ({ layers }) => (
  <PanelGroup title="Selected layers">
    <LayerPickList layers={layers} onPick={(id) => emitSelectLayers([id])} />
  </PanelGroup>
);
