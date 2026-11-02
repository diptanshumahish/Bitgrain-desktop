import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { PanelGroup } from "../../../ui/panel-group";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { MixedColorField } from "./mixed-color-field";
import { sharedValue } from "./shared-value";
import { buildEntries } from "./build-entries";
import type { LayerUpdateEntry } from "./layer-update-entry";
import {
  readFill,
  fillUpdate,
  readStrokeColor,
  strokeColorUpdate,
} from "./layer-paint";
import { collectStrokeWidths, strokeWidthUpdater } from "../nested-paint/nested-stroke-width";

const MAX_STROKE_WIDTH = 200;
const STROKE_STEP = 0.5;

interface MultiPaintSectionProps {
  layers: Layer[];
  onUpdateLayers: (entries: LayerUpdateEntry[]) => void;
}

export const MultiPaintSection: React.FC<MultiPaintSectionProps> = ({ layers, onUpdateLayers }) => {
  const fill = sharedValue(layers.map(readFill));
  const strokeColor = sharedValue(layers.map(readStrokeColor));
  const strokeWidth = sharedValue(collectStrokeWidths(layers));
  const showStroke = strokeColor.first !== null || strokeWidth.first !== null;

  return (
    <>
      {fill.first !== null && (
        <PanelGroup title="Fill">
          <MixedColorField
            shared={fill}
            onChange={(color) => onUpdateLayers(buildEntries(layers, (layer) => fillUpdate(layer, color)))}
          />
        </PanelGroup>
      )}
      {showStroke && (
        <PanelGroup title="Stroke">
          {strokeColor.first !== null && (
            <MixedColorField
              shared={strokeColor}
              onChange={(color) => onUpdateLayers(buildEntries(layers, (layer) => strokeColorUpdate(layer, color)))}
            />
          )}
          <ScrubField
            label="Width"
            value={strokeWidth.first ?? 0}
            mixed={strokeWidth.mixed}
            min={0}
            max={MAX_STROKE_WIDTH}
            step={STROKE_STEP}
            onChange={(width) => onUpdateLayers(buildEntries(layers, strokeWidthUpdater(width)))}
          />
        </PanelGroup>
      )}
    </>
  );
};
