import React from "react";
import { Minus, Plus } from "lucide-react";
import type { DashStyle, LineCap, LineJoin, VectorLayer } from "../../../../data/studioTypes";
import { ColorPicker } from "../../ui/ColorPicker";
import { BtnGroup, ScrubField } from "../../ui/panelPrimitives";
import { PanelGroup } from "../../ui/panel-group";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { DashStyleIcon, LineCapIcon, LineJoinIcon } from "./stroke-icons";

interface VectorStrokeSectionProps {
  layer: VectorLayer;
  onChange: (updates: Partial<VectorLayer>) => void;
}

const DEFAULT_STROKE_COLOR = "#141414";
const DEFAULT_STROKE_WIDTH = 2;
const MAX_STROKE_WIDTH = 200;
const FULL_PROGRESS = 100;

const DASH_OPTIONS: { value: DashStyle; title: string }[] = [
  { value: "solid", title: "Solid" },
  { value: "dashed", title: "Dashed" },
  { value: "dotted", title: "Dotted" },
];

const CAP_OPTIONS: { value: LineCap; title: string }[] = [
  { value: "butt", title: "Flat end" },
  { value: "round", title: "Round end" },
  { value: "square", title: "Square end" },
];

const JOIN_OPTIONS: { value: LineJoin; title: string }[] = [
  { value: "miter", title: "Sharp corner" },
  { value: "round", title: "Round corner" },
  { value: "bevel", title: "Cut corner" },
];

const isEmptyColor = (color: string): boolean => color === "transparent" || color === "none";

const hasStroke = (layer: VectorLayer): boolean => layer.strokeWidth > 0 && !isEmptyColor(layer.strokeColor);

export const VectorStrokeSection: React.FC<VectorStrokeSectionProps> = ({ layer, onChange }) => {
  const visible = hasStroke(layer);

  const addStroke = () =>
    onChange({
      strokeWidth: layer.strokeWidth > 0 ? layer.strokeWidth : DEFAULT_STROKE_WIDTH,
      strokeColor: isEmptyColor(layer.strokeColor) ? DEFAULT_STROKE_COLOR : layer.strokeColor,
      strokeColorVar: undefined,
    });

  const toggle = visible ? (
    <HeaderIconButton title="Remove stroke" onClick={() => onChange({ strokeWidth: 0 })}>
      <Minus size={13} strokeWidth={1.75} />
    </HeaderIconButton>
  ) : (
    <HeaderIconButton title="Add stroke" onClick={addStroke}>
      <Plus size={13} strokeWidth={1.75} />
    </HeaderIconButton>
  );

  return (
    <PanelGroup title="Stroke" actions={toggle}>
      {visible && (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2">
            <ColorPicker
              color={layer.strokeColor}
              varId={layer.strokeColorVar}
              onChange={(color) => onChange({ strokeColor: color, strokeColorVar: undefined })}
              onBindVariable={(id, value) => onChange({ strokeColor: value, strokeColorVar: id })}
            />
            <ScrubField label="W" value={layer.strokeWidth} min={0} max={MAX_STROKE_WIDTH} onChange={(value) => onChange({ strokeWidth: value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <BtnGroup
              options={DASH_OPTIONS.map(({ value, title }) => ({ value, title, icon: <DashStyleIcon style={value} /> }))}
              value={layer.dashStyle}
              onChange={(value) => onChange({ dashStyle: value as DashStyle })}
            />
            <BtnGroup
              options={CAP_OPTIONS.map(({ value, title }) => ({ value, title, icon: <LineCapIcon cap={value} /> }))}
              value={layer.lineCap}
              onChange={(value) => onChange({ lineCap: value as LineCap })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <BtnGroup
              options={JOIN_OPTIONS.map(({ value, title }) => ({ value, title, icon: <LineJoinIcon join={value} /> }))}
              value={layer.lineJoin}
              onChange={(value) => onChange({ lineJoin: value as LineJoin })}
            />
            <ScrubField
              label="Draw"
              value={Math.round(layer.drawProgress ?? FULL_PROGRESS)}
              min={0}
              max={FULL_PROGRESS}
              suffix="%"
              onChange={(value) => onChange({ drawProgress: value })}
            />
          </div>
        </>
      )}
    </PanelGroup>
  );
};
