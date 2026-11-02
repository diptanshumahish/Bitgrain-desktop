import React from "react";
import { Circle, Blend } from "lucide-react";
import type { ShapeLayer, BlendMode } from "@bitgrain/studio-core/model/studio-types";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { BLEND_MODE_OPTIONS, BLEND_MODE_HINT } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { ShapeSpecimenCard } from "./shape/ShapeSpecimenCard";
import { ShapeGeometrySection } from "./shape/ShapeGeometrySection";
import { ShapePaintSections } from "./shape/ShapePaintSections";
import { ShapeStrokeSection } from "./shape/ShapeStrokeSection";
import { isClosedShape, isFrameShape } from "@bitgrain/studio-core/shapes/shape-kinds";
import { CornerRadiusFields } from "./corner/CornerRadiusFields";
import { EffectsListSection } from "./paint-list/effects/EffectsListSection";

interface ShapePropertiesProps {
  layer: ShapeLayer;
  onChange: (updates: Partial<ShapeLayer>) => void;
  onAlign?: (alignment: string) => void;
}

export const ShapeProperties: React.FC<ShapePropertiesProps> = ({
  layer,
  onChange,
  onAlign,
}) => {
  const frame = isFrameShape(layer.shapeType);
  const closed = isClosedShape(layer.shapeType);
  const isRect = layer.shapeType === "rect";

  return (
    <div className="flex flex-col font-editorial">
      <ShapeSpecimenCard layer={layer} />
      <PanelGroup title="Position & size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          showRadius={false}
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation,
            borderRadius: layer.borderRadius,
          }}
          onChange={onChange}
        />
        {isRect && (
          <CornerRadiusFields
            radius={layer.borderRadius}
            radii={layer.cornerRadii}
            smoothing={layer.cornerSmoothing}
            onChange={onChange}
          />
        )}
      </PanelGroup>

      <ShapeGeometrySection layer={layer} onChange={onChange} />

      {closed && <ShapePaintSections layer={layer} onChange={onChange} />}

      {frame && (
        <PanelGroup title="Frame">
          <ColorPicker
            color={layer.fill}
            varId={layer.fillVar}
            onChange={(color) => onChange({ fill: color, fillVar: undefined })}
            onBindVariable={(id, value) => onChange({ fill: value, fillVar: id })}
          />
        </PanelGroup>
      )}

      {!closed && <ShapeStrokeSection layer={layer} onChange={onChange} />}

      <EffectsListSection effects={layer.layerEffects} onChange={(layerEffects) => onChange({ layerEffects })} />

      <PanelGroup title="Appearance">
        <div className="grid grid-cols-2 gap-2">
          <ScrubField
            label={<Circle size={12} strokeWidth={1.75} />}
            value={Math.round(layer.opacity * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => onChange({ opacity: v / 100 })}
          />
          <Dropdown
            icon={<Blend size={13} strokeWidth={1.75} />}
            options={BLEND_MODE_OPTIONS}
            title={BLEND_MODE_HINT}
            value={layer.blendMode ?? "normal"}
            onChange={(v) => onChange({ blendMode: v as BlendMode })}
          />
        </div>
      </PanelGroup>
    </div>
  );
};
