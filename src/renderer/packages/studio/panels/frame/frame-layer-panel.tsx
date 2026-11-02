import React from "react";
import type { FrameLayer, Layer } from "@bitgrain/studio-core/model/studio-types";
import { FrameProperties } from "../FrameProperties";
import { AutoLayoutSection } from "../auto-layout/auto-layout-section";
import { withFrameResize } from "../../layers/resize/container-resize";
import { EffectsListSection } from "../paint-list/effects/EffectsListSection";
import { PanelGroup } from "../../ui/panel-group";
import { AppearanceControls } from "../appearance-controls";

interface FrameLayerPanelProps {
  layer: FrameLayer;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
}

export const FrameLayerPanel: React.FC<FrameLayerPanelProps> = ({ layer, onUpdateLayer }) => {
  const update = (updates: Partial<FrameLayer>): void => onUpdateLayer(layer.id, updates);

  return (
    <FrameProperties
      name={layer.name}
      background={layer.background}
      backgroundVar={layer.backgroundVar}
      width={layer.width}
      height={layer.height}
      x={layer.x}
      y={layer.y}
      clip={layer.clip ?? true}
      namePlaceholder="Frame"
      kind="frame"
      onRename={(name) => update({ name })}
      onBackgroundChange={(color) => update({ background: color, backgroundVar: undefined })}
      onBackgroundBind={(varId, value) => update({ background: value, backgroundVar: varId })}
      onResize={(width, height) => update(withFrameResize(layer, { width, height }))}
      onMove={(x, y) => update({ x, y })}
      onClipChange={(clip) => update({ clip })}
      layoutGrids={layer.layoutGrids}
      onLayoutGridsChange={(layoutGrids) => update({ layoutGrids })}
      scaleContents={layer.scaleContents ?? false}
      onScaleContentsChange={(scaleContents) => update({ scaleContents })}
    >
      <PanelGroup title="Appearance">
        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          onOpacityChange={(opacity) => update({ opacity })}
          onBlendModeChange={(blendMode) => update({ blendMode })}
        />
      </PanelGroup>
      <AutoLayoutSection settings={layer} allowHug onChange={update} />
      <EffectsListSection effects={layer.layerEffects} excludeKinds={["layer-blur"]} onChange={(layerEffects) => update({ layerEffects })} />
    </FrameProperties>
  );
};
