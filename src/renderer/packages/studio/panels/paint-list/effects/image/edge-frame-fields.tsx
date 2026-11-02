import React from "react";
import { Shuffle } from "lucide-react";
import type { EdgeStyle, TornEdgeEffect, TornEdgeSides } from "@bitgrain/studio-core/model/studio-types";
import { ScrubField, SmallBtn } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { Dropdown } from "../../../../ui/dropdown";
import { ColorPicker } from "../../../../ui/ColorPicker";

interface EdgeFrameFieldsProps {
  effect: TornEdgeEffect;
  onChange: (effect: TornEdgeEffect) => void;
}

const STYLE_OPTIONS = [
  { value: "torn", label: "Torn" },
  { value: "deckle", label: "Deckle" },
  { value: "perforation", label: "Perforation" },
];

const FRAME_OPTIONS = [
  { value: "paper", label: "Paper" },
  { value: "polaroid", label: "Polaroid" },
];

const SIDE_BUTTONS: Array<{ key: keyof TornEdgeSides; label: string; glyph: string }> = [
  { key: "top", label: "Top", glyph: "↑" },
  { key: "right", label: "Right", glyph: "→" },
  { key: "bottom", label: "Bottom", glyph: "↓" },
  { key: "left", label: "Left", glyph: "←" },
];

const ROUGH_MAX = 100;
const DETAIL_MIN = 3;
const DETAIL_MAX = 48;
const BORDER_MAX = 60;
const DEFAULT_BORDER_COLOR = "#ffffff";
const LABEL_CLASS = "text-[12px] text-[var(--s-text-subtle)] font-medium";

export const EdgeFrameFields: React.FC<EdgeFrameFieldsProps> = ({ effect, onChange }) => {
  const update = (patch: Partial<TornEdgeEffect>): void => onChange({ ...effect, ...patch });
  const toggleSide = (key: keyof TornEdgeSides): void => update({ sides: { ...effect.sides, [key]: !effect.sides[key] } });

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Dropdown value={effect.style ?? "torn"} onChange={(value) => update({ style: value as EdgeStyle })} options={STYLE_OPTIONS} />
        <Dropdown value={effect.frame ?? "paper"} onChange={(value) => update({ frame: value as TornEdgeEffect["frame"] })} options={FRAME_OPTIONS} />
      </div>
      <div className="flex items-center justify-between">
        <span className={LABEL_CLASS}>Torn sides</span>
        <div className="flex gap-1">
          {SIDE_BUTTONS.map((side) => (
            <SmallBtn key={side.key} title={side.label} active={effect.sides[side.key]} onClick={() => toggleSide(side.key)}>
              {side.glyph}
            </SmallBtn>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ScrubField label="Rough" value={effect.roughness} min={0} max={ROUGH_MAX} onChange={(roughness) => update({ roughness })} />
        <ScrubField label="Detail" value={effect.detail} min={DETAIL_MIN} max={DETAIL_MAX} step={1} onChange={(detail) => update({ detail })} />
      </div>
      <ScrubField label="Border" value={effect.border} min={0} max={BORDER_MAX} step={1} onChange={(border) => update({ border })} />
      <ColorPicker color={effect.borderColor ?? DEFAULT_BORDER_COLOR} onChange={(borderColor) => update({ borderColor })} />
      <div className="flex items-center justify-between">
        <span className={LABEL_CLASS}>Tear pattern</span>
        <SmallBtn title="Shuffle tear" onClick={() => update({ seed: effect.seed + 1 })}>
          <Shuffle size={11} />
        </SmallBtn>
      </div>
    </>
  );
};
