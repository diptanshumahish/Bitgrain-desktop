import React from "react";
import type { EffectParams, HalftoneShape, HalftoneStyle } from "../../../types";
import { SliderRow } from "./SliderRow";
import { Toggle, JitterControls } from "./filter-shared";

const HALFTONE_STYLES: { id: HalftoneStyle; label: string; glyph: string }[] = [
  { id: "mono", label: "Mono", glyph: "● ●" },
  { id: "color", label: "Color", glyph: "● ● ●" },
  { id: "cmyk", label: "CMYK", glyph: "◉ ◎ ◐" },
];

const HALFTONE_SHAPES: { id: HalftoneShape; label: string }[] = [
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
];

interface HalftoneParamsProps {
  params: EffectParams;
  onChange: (patch: Partial<EffectParams>) => void;
}

export const HalftoneParams: React.FC<HalftoneParamsProps> = ({ params, onChange }) => (
  <>
    <div className="grid grid-cols-3 gap-1">
      {HALFTONE_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange({ halftoneStyle: style.id })}
          className={`flex flex-col items-center gap-1 px-1 py-2 rounded-md border text-[9px] transition-colors ${
            params.halftoneStyle === style.id
              ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-text)]"
              : "border-[var(--s-border)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
          }`}
        >
          <span className="text-[11px]">{style.glyph}</span>
          <span>{style.label}</span>
        </button>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-1">
      {HALFTONE_SHAPES.map((shape) => (
        <button
          key={shape.id}
          onClick={() => onChange({ halftoneShape: shape.id })}
          className={`px-1 py-1.5 rounded-md border text-[9px] transition-colors ${
            (params.halftoneShape ?? "round") === shape.id
              ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-text)]"
              : "border-[var(--s-border)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
          }`}
        >
          {shape.label}
        </button>
      ))}
    </div>
    <SliderRow label="Cell size" min={2} max={32} step={1} unit="px" value={params.halftoneCell ?? 2} onChange={(v) => onChange({ halftoneCell: v })} />
    <SliderRow label="Angle" min={0} max={90} step={5} unit="°" value={params.halftoneAngle ?? 45} onChange={(v) => onChange({ halftoneAngle: v })} />
    <SliderRow label="Intensity" min={0.1} max={3} step={0.1} unit="x" value={params.halftoneIntensity ?? 1} onChange={(v) => onChange({ halftoneIntensity: v })} />
    <SliderRow label="Sharpness" min={0} max={100} step={1} value={params.halftoneSharpness ?? 60} onChange={(v) => onChange({ halftoneSharpness: v })} />
    <Toggle label="Invert Dots" active={params.halftoneInvert ?? false} onClick={() => onChange({ halftoneInvert: !params.halftoneInvert })} />
    <JitterControls
      hz={params.halftoneJitterHz ?? 0}
      auto={params.halftoneJitterAuto ?? false}
      onChangeHz={(v) => onChange({ halftoneJitterHz: v })}
      onToggleAuto={() => onChange({ halftoneJitterAuto: !(params.halftoneJitterAuto ?? false) })}
    />
  </>
);
