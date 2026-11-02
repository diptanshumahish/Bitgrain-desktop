import React from "react";
import type { GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import { laidOutChildren } from "@bitgrain/studio-core/layout/auto-layout";
import { LayerBoxMap } from "../../ui/layer-box-map";

interface GroupLayerMapProps {
  layer: GroupLayer;
}

export const GroupLayerMap: React.FC<GroupLayerMapProps> = ({ layer }) => (
  <LayerBoxMap width={layer.width} height={layer.height} boxes={laidOutChildren(layer)} />
);
