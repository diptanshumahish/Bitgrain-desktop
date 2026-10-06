import React from "react";
import { Circle, Blend } from "lucide-react";
import type { VectorLayer, BlendMode } from "../../../data/studioTypes";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField, BtnGroup } from "../ui/panelPrimitives";
import { BLEND_MODE_OPTIONS } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { VectorFillSection } from "./VectorFillSection";

interface VectorPropertiesProps {
  layer: VectorLayer;
  pageImage?: string | null;
  onChange: (updates: Partial<VectorLayer>) => void;
  onAlign?: (alignment: string) => void;
}

const LINE_CAP_OPTIONS = [
  { label: "Round", value: "round" },
  { label: "Square", value: "square" },
  { label: "Butt", value: "butt" },
];

const LINE_JOIN_OPTIONS = [
  { label: "Round", value: "round" },
  { label: "Miter", value: "miter" },
  { label: "Bevel", value: "bevel" },
];

const LINE_STYLE_OPTIONS = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
];

const LabeledControl: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">{label}</span>
    {children}
  </div>
);

export const VectorProperties: React.FC<VectorPropertiesProps> = ({
  layer,
  pageImage,
  onChange,
  onAlign,
}) => {
  const isClosed = layer.path.closed;

  return (
    <div className="flex flex-col font-editorial">
      <PanelGroup title="Position & Size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation,
            borderRadius: 0,
          }}
          onChange={onChange}
        />
      </PanelGroup>

      {isClosed && (
        <PanelGroup title="Fill">
          <VectorFillSection layer={layer} pageImage={pageImage ?? null} onChange={onChange} />
        </PanelGroup>
      )}

      <PanelGroup title="Stroke">
        <LabeledControl label="Color">
          <ColorPicker
            color={layer.strokeColor}
            varId={layer.strokeColorVar}
            onChange={(c) => onChange({ strokeColor: c, strokeColorVar: undefined })}
            onBindVariable={(id, value) => onChange({ strokeColor: value, strokeColorVar: id })}
          />
        </LabeledControl>

        <ScrubField
          label="Width"
          value={layer.strokeWidth}
          min={0}
          max={200}
          onChange={(v) => onChange({ strokeWidth: v })}
        />

        <LabeledControl label="Style">
          <BtnGroup
            options={LINE_STYLE_OPTIONS}
            value={layer.dashStyle}
            onChange={(v) => onChange({ dashStyle: v as VectorLayer["dashStyle"] })}
          />
        </LabeledControl>

        <LabeledControl label="Cap">
          <BtnGroup
            options={LINE_CAP_OPTIONS}
            value={layer.lineCap}
            onChange={(v) => onChange({ lineCap: v as VectorLayer["lineCap"] })}
          />
        </LabeledControl>

        <LabeledControl label="Join">
          <BtnGroup
            options={LINE_JOIN_OPTIONS}
            value={layer.lineJoin}
            onChange={(v) => onChange({ lineJoin: v as VectorLayer["lineJoin"] })}
          />
        </LabeledControl>

        <ScrubField
          label="Draw-on"
          value={Math.round(layer.drawProgress ?? 100)}
          min={0}
          max={100}
          suffix="%"
          onChange={(v) => onChange({ drawProgress: v })}
        />
      </PanelGroup>

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
            value={layer.blendMode ?? "normal"}
            onChange={(v) => onChange({ blendMode: v as BlendMode })}
          />
        </div>
      </PanelGroup>
    </div>
  );
};
