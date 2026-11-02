import React from "react";
import { Circle, Blend } from "lucide-react";
import type { InkLayer, BlendMode } from "@bitgrain/studio-core/model/studio-types";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { BLEND_MODE_OPTIONS, BLEND_MODE_HINT } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";

interface InkPropertiesProps {
  layer: InkLayer;
  onChange: (updates: Partial<InkLayer>) => void;
  onAlign?: (alignment: string) => void;
}

const LabeledControl: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">{label}</span>
    {children}
  </div>
);

export const InkProperties: React.FC<InkPropertiesProps> = ({ layer, onChange, onAlign }) => {
  return (
    <div className="flex flex-col font-editorial">
      <PanelGroup title="Position & size">
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
          showRadius={false}
        />
      </PanelGroup>

      <PanelGroup title="Brush">
        <LabeledControl label="Color">
          <ColorPicker
            color={layer.color}
            varId={layer.colorVar}
            onChange={(c) => onChange({ color: c, colorVar: undefined })}
            onBindVariable={(id, value) => onChange({ color: value, colorVar: id })}
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
            title={BLEND_MODE_HINT}
            value={layer.blendMode ?? "normal"}
            onChange={(v) => onChange({ blendMode: v as BlendMode })}
          />
        </div>
      </PanelGroup>
    </div>
  );
};
