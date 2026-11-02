import React from "react";
import type { ShapeLayer } from "@bitgrain/studio-core/model/studio-types";
import { ColorPicker } from "../../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { PanelGroup } from "../../ui/panel-group";
import { StrokeStyleControls } from "../stroke/StrokeStyleControls";
import { hasVisibleStroke } from "@bitgrain/studio-core/layers/visible-stroke";
import { isClosedShape, isFrameShape, isLineShape } from "@bitgrain/studio-core/shapes/shape-kinds";

const MAX_STROKE_WIDTH = 100;

interface ShapeStrokeSectionProps {
  layer: ShapeLayer;
  onChange: (updates: Partial<ShapeLayer>) => void;
}

export const ShapeStrokeSection: React.FC<ShapeStrokeSectionProps> = ({ layer, onChange }) => {
  const line = isLineShape(layer.shapeType);
  const frame = isFrameShape(layer.shapeType);
  const closed = isClosedShape(layer.shapeType);
  const color = line ? layer.stroke || layer.fill : layer.stroke;
  const showStyle = line || frame || (hasVisibleStroke(layer.stroke) && layer.strokeWidth > 0);

  return (
    <PanelGroup title={line ? "Line" : "Stroke"}>
      {!frame && (
        <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2">
          <ColorPicker
            color={color}
            varId={layer.strokeVar}
            onChange={(next) => onChange({ stroke: next, strokeVar: undefined })}
            onBindVariable={(id, value) => onChange({ stroke: value, strokeVar: id })}
          />
          <ScrubField label="W" value={layer.strokeWidth} min={0} max={MAX_STROKE_WIDTH} onChange={(value) => onChange({ strokeWidth: value })} />
        </div>
      )}
      {showStyle && (
        <StrokeStyleControls
          value={layer}
          defaultAlign="inside"
          defaultCap={line ? "round" : "butt"}
          defaultJoin={line ? "round" : "miter"}
          showAlign={closed}
          onChange={onChange}
        />
      )}
    </PanelGroup>
  );
};
