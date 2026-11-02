import React from "react";
import type { Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { DistributeAxis } from "@bitgrain/studio-core/layers/layer-order";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { AppearanceControls } from "./appearance-controls";
import { SelectionSpecimenCard } from "./multi-select/selection-specimen-card";
import { DistributeRow } from "./multi-select/distribute-row";
import { SelectedLayersList } from "./multi-select/selected-layers-list";
import { ArrangeActions } from "./multi-select/arrange-actions";
import { MultiGeometrySection } from "./multi-select/shared/multi-geometry-section";
import { MultiPaintSection } from "./multi-select/shared/multi-paint-section";
import { MultiTypographySection } from "./multi-select/shared/multi-typography-section";
import { SelectionColoursSection } from "./multi-select/nested-paint/selection-colours-section";
import type { LayerUpdateEntry } from "./multi-select/shared/layer-update-entry";

interface MultiSelectPropertiesProps {
  layers: Layer[];
  onAlign: (alignment: string) => void;
  onGroup: () => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onUpdateLayers?: (entries: LayerUpdateEntry[]) => void;
  onScatterCollage?: () => void;
  onDistribute?: (axis: DistributeAxis) => void;
}

const MIN_DISTRIBUTE_COUNT = 3;

const allText = (layers: Layer[]): TextLayer[] | null =>
  layers.length > 0 && layers.every((layer) => layer.type === "text") ? (layers as TextLayer[]) : null;

export const MultiSelectProperties: React.FC<MultiSelectPropertiesProps> = ({
  layers,
  onAlign,
  onGroup,
  onUpdateLayer,
  onUpdateLayers,
  onScatterCollage,
  onDistribute,
}) => {
  const updateEntries = (entries: LayerUpdateEntry[]): void => {
    if (onUpdateLayers) onUpdateLayers(entries);
    else entries.forEach((entry) => onUpdateLayer(entry.id, entry.updates));
  };
  const updateAll = (updates: Partial<Layer>): void => {
    updateEntries(layers.map((layer) => ({ id: layer.id, updates })));
  };
  const first = layers[0];
  const textLayers = allText(layers);

  return (
    <div className="flex flex-col font-editorial pb-6">
      <SelectionSpecimenCard layers={layers} />

      <PanelGroup title="Align">
        <AlignRow onAlign={onAlign} />
      </PanelGroup>

      {onDistribute && (
        <PanelGroup title="Distribute">
          <DistributeRow enabled={layers.length >= MIN_DISTRIBUTE_COUNT} onDistribute={onDistribute} />
        </PanelGroup>
      )}

      <MultiGeometrySection layers={layers} onUpdateLayers={updateEntries} />

      {textLayers && <MultiTypographySection layers={textLayers} onUpdateLayers={updateEntries} />}

      <MultiPaintSection layers={layers} onUpdateLayers={updateEntries} />

      <SelectionColoursSection layers={layers} onUpdateLayers={updateEntries} />

      {first && (
        <PanelGroup title="Appearance">
          <AppearanceControls
            opacity={first.opacity}
            blendMode={first.blendMode}
            onOpacityChange={(opacity) => updateAll({ opacity })}
            onBlendModeChange={(blendMode) => updateAll({ blendMode })}
          />
        </PanelGroup>
      )}

      <PanelGroup title="Arrange">
        <ArrangeActions count={layers.length} onGroup={onGroup} onScatterCollage={onScatterCollage} />
      </PanelGroup>

      <SelectedLayersList layers={layers} />
    </div>
  );
};
