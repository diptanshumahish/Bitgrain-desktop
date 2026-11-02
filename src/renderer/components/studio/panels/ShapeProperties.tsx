import React from "react";
import { Circle, Blend } from "lucide-react";
import type { ShapeLayer, BlendMode } from "../../../data/studioTypes";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField } from "../ui/panelPrimitives";
import { BLEND_MODE_OPTIONS } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { ShapeSpecimenCard } from "./shape/ShapeSpecimenCard";

interface ShapePropertiesProps {
  layer: ShapeLayer;
  onChange: (updates: Partial<ShapeLayer>) => void;
  onAlign?: (alignment: string) => void;
}

const isFrame = (t: ShapeLayer["shapeType"]) => t.startsWith("frame");
const isLine = (t: ShapeLayer["shapeType"]) => t === "line" || t === "arrow";

const ColorField: React.FC<{
  label: string;
  color: string;
  varId?: string;
  onChange: (color: string) => void;
  onBindVariable: (varId: string, value: string) => void;
}> = ({ label, color, varId, onChange, onBindVariable }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">{label}</span>
    <ColorPicker
      color={color}
      varId={varId}
      onChange={onChange}
      onBindVariable={onBindVariable}
    />
  </div>
);

export const ShapeProperties: React.FC<ShapePropertiesProps> = ({
  layer,
  onChange,
  onAlign,
}) => {
  const frame = isFrame(layer.shapeType);
  const line = isLine(layer.shapeType);
  const isRect = layer.shapeType === "rect";

  const opacityField = (
    <ScrubField
      label={<Circle size={12} strokeWidth={1.75} />}
      value={Math.round(layer.opacity * 100)}
      min={0}
      max={100}
      suffix="%"
      onChange={(v) => onChange({ opacity: v / 100 })}
    />
  );

  const blendDropdown = (
    <Dropdown
      icon={<Blend size={13} strokeWidth={1.75} />}
      options={BLEND_MODE_OPTIONS}
      value={layer.blendMode ?? "normal"}
      onChange={(v) => onChange({ blendMode: v as BlendMode })}
    />
  );

  return (
    <div className="flex flex-col font-editorial">
      <ShapeSpecimenCard layer={layer} />
      <PanelGroup title="Position & Size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          showRadius={isRect}
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
      </PanelGroup>

      <PanelGroup title="Appearance">
        {!frame && !line && (
          <div className="grid grid-cols-2 gap-2">
            <ColorField
              label="Fill"
              color={layer.fill}
              varId={layer.fillVar}
              onChange={(c) => onChange({ fill: c, fillVar: undefined })}
              onBindVariable={(id, value) => onChange({ fill: value, fillVar: id })}
            />
            <ColorField
              label="Stroke"
              color={layer.stroke}
              varId={layer.strokeVar}
              onChange={(c) => onChange({ stroke: c, strokeVar: undefined })}
              onBindVariable={(id, value) => onChange({ stroke: value, strokeVar: id })}
            />
          </div>
        )}

        {frame && (
          <ColorField
            label="Frame color"
            color={layer.fill}
            varId={layer.fillVar}
            onChange={(c) => onChange({ fill: c, fillVar: undefined })}
            onBindVariable={(id, value) => onChange({ fill: value, fillVar: id })}
          />
        )}

        {line && (
          <ColorField
            label="Color"
            color={layer.stroke || layer.fill}
            varId={layer.strokeVar}
            onChange={(c) => onChange({ stroke: c, strokeVar: undefined })}
            onBindVariable={(id, value) => onChange({ stroke: value, strokeVar: id })}
          />
        )}

        {!frame && !line ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <ScrubField
                label="Weight"
                value={layer.strokeWidth}
                min={0}
                max={100}
                onChange={(v) => onChange({ strokeWidth: v })}
              />
              {opacityField}
            </div>
            {blendDropdown}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {opacityField}
            {blendDropdown}
          </div>
        )}
      </PanelGroup>
    </div>
  );
};
