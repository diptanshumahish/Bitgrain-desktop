import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../../ui/panel-group";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { sharedValue } from "./shared-value";
import { buildEntries } from "./build-entries";
import type { LayerUpdateEntry } from "./layer-update-entry";
import { readRadius, radiusUpdate, readRotation } from "./layer-geometry";

const MIN_SIZE = 4;
const MAX_ROTATION = 360;

interface MultiGeometrySectionProps {
  layers: Layer[];
  onUpdateLayers: (entries: LayerUpdateEntry[]) => void;
}

export const MultiGeometrySection: React.FC<MultiGeometrySectionProps> = ({ layers, onUpdateLayers }) => {
  const width = sharedValue(layers.map((layer) => layer.width));
  const height = sharedValue(layers.map((layer) => layer.height));
  const rotation = sharedValue(layers.map(readRotation));
  const radius = sharedValue(layers.map(readRadius));
  const applyAll = (updates: Partial<Layer>): void => onUpdateLayers(buildEntries(layers, () => updates));

  return (
    <PanelGroup title="Size">
      <div className="grid grid-cols-2 gap-2">
        <ScrubField label="W" value={width.first ?? 0} mixed={width.mixed} min={MIN_SIZE} step={1} onChange={(value) => applyAll({ width: value })} />
        <ScrubField label="H" value={height.first ?? 0} mixed={height.mixed} min={MIN_SIZE} step={1} onChange={(value) => applyAll({ height: value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ScrubField
          label="Rotate"
          value={rotation.first ?? 0}
          mixed={rotation.mixed}
          min={-MAX_ROTATION}
          max={MAX_ROTATION}
          step={1}
          suffix="°"
          onChange={(value) => applyAll({ rotation: value })}
        />
        {radius.first !== null && (
          <ScrubField
            label="Radius"
            value={radius.first}
            mixed={radius.mixed}
            min={0}
            step={1}
            onChange={(value) => onUpdateLayers(buildEntries(layers, (layer) => radiusUpdate(layer, value)))}
          />
        )}
      </div>
    </PanelGroup>
  );
};
