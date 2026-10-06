import React from "react";
import { Shuffle } from "lucide-react";
import type { EdgeStyle, TornEdgeEffect, TornEdgeSides } from "../../../data/studioTypes";
import { Section, ScrubField, Toggle, SmallBtn } from "../ui/panelPrimitives";
import { Dropdown } from "../ui/dropdown";
import { ColorPicker } from "../ui/ColorPicker";
import { defaultTornEdge, hashStringSeed } from "../../../utils/torn-edge";

interface EdgeFrameControlsProps {
  effect: TornEdgeEffect | undefined;
  layerId: string;
  onChange: (effect: TornEdgeEffect | undefined) => void;
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

export const EdgeFrameControls: React.FC<EdgeFrameControlsProps> = ({ effect, layerId, onChange }) => {
  const handleToggle = (enabled: boolean) => {
    onChange(enabled ? defaultTornEdge(hashStringSeed(layerId)) : undefined);
  };

  const update = (patch: Partial<TornEdgeEffect>) => {
    if (!effect) return;
    onChange({ ...effect, ...patch });
  };

  const toggleSide = (key: keyof TornEdgeSides) => {
    if (!effect) return;
    update({ sides: { ...effect.sides, [key]: !effect.sides[key] } });
  };

  return (
    <Section
      title="Edge & frame"
      right={<Toggle value={Boolean(effect)} onChange={handleToggle} />}
    >
      {effect && (
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="grid grid-cols-2 gap-2">
            <Dropdown
              value={effect.style ?? "torn"}
              onChange={(value) => update({ style: value as EdgeStyle })}
              options={STYLE_OPTIONS}
            />
            <Dropdown
              value={effect.frame ?? "paper"}
              onChange={(value) => update({ frame: value as TornEdgeEffect["frame"] })}
              options={FRAME_OPTIONS}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Torn sides</span>
            <div className="flex gap-1">
              {SIDE_BUTTONS.map((side) => (
                <SmallBtn
                  key={side.key}
                  title={side.label}
                  active={effect.sides[side.key]}
                  onClick={() => toggleSide(side.key)}
                >
                  {side.glyph}
                </SmallBtn>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <ScrubField label="Rough" value={effect.roughness} min={0} max={100} onChange={(v) => update({ roughness: v })} />
            <ScrubField label="Detail" value={effect.detail} min={3} max={48} step={1} onChange={(v) => update({ detail: v })} />
          </div>

          <ScrubField label="Border" value={effect.border} min={0} max={60} step={1} onChange={(v) => update({ border: v })} />

          <ColorPicker
            color={effect.borderColor ?? "#ffffff"}
            onChange={(color) => update({ borderColor: color })}
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">Tear pattern</span>
            <SmallBtn title="Shuffle tear" onClick={() => update({ seed: effect.seed + 1 })}>
              <Shuffle size={11} />
            </SmallBtn>
          </div>
        </div>
      )}
    </Section>
  );
};
