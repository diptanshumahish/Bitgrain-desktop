import React from "react";
import type { AsciiTone } from "../../../../../engine/types";
import {
  ASCII_DETAILED,
  ASCII_CODE,
  ASCII_STANDARD,
  ASCII_BLOCKS,
} from "../../../../../engine/plugins/ascii";
import type { EffectParams } from "../../../types";
import { SliderRow } from "./SliderRow";
import { Toggle } from "./filter-shared";

interface AsciiParamsProps {
  params: EffectParams;
  onChange: (patch: Partial<EffectParams>) => void;
}

const CHARSETS: { label: string; value: string }[] = [
  { label: "Detailed", value: ASCII_DETAILED },
  { label: "Code", value: ASCII_CODE },
  { label: "Standard", value: ASCII_STANDARD },
  { label: "Blocks", value: ASCII_BLOCKS },
];

const TONES: { label: string; value: AsciiTone }[] = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
];

const optionClass = (active: boolean): string =>
  `px-1 py-1.5 rounded-md border text-[9px] transition-colors ${
    active
      ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-text)]"
      : "border-[var(--s-border)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
  }`;

export const AsciiParams: React.FC<AsciiParamsProps> = ({ params, onChange }) => {
  const charset = params.asciiCharset ?? ASCII_DETAILED;
  const tone = params.asciiTone ?? "dark";
  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        {CHARSETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange({ asciiCharset: preset.value })}
            className={optionClass(charset === preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={charset}
        onChange={(event) => onChange({ asciiCharset: event.target.value })}
        spellCheck={false}
        placeholder="Custom characters"
        className="w-full font-mono text-[10px] bg-[var(--s-bg-input)] text-[var(--s-text)] border border-[var(--s-border)] rounded-md px-2 py-1.5 outline-none focus:border-[var(--s-accent)] transition-colors"
      />
      <div className="grid grid-cols-2 gap-1">
        {TONES.map((item) => (
          <button
            key={item.value}
            onClick={() => onChange({ asciiTone: item.value })}
            className={optionClass(tone === item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <SliderRow label="Detail" min={0.4} max={2.5} step={0.1} unit="x" value={params.asciiDensity ?? 1} onChange={(v) => onChange({ asciiDensity: v })} />
      <Toggle label="Edge glyphs" active={params.asciiEdges ?? false} onClick={() => onChange({ asciiEdges: !params.asciiEdges })} />
      {params.asciiEdges && (
        <SliderRow label="Edge threshold" min={0} max={1} step={0.05} value={params.asciiEdgeThreshold ?? 0.5} onChange={(v) => onChange({ asciiEdgeThreshold: v })} />
      )}
      <Toggle label="Source color" active={params.isColor ?? true} onClick={() => onChange({ isColor: !(params.isColor ?? true) })} />
    </>
  );
};

export const BrailleParams: React.FC<AsciiParamsProps> = ({ params, onChange }) => (
  <>
    <SliderRow label="Detail" min={0.4} max={2.5} step={0.1} unit="x" value={params.asciiDensity ?? 1} onChange={(v) => onChange({ asciiDensity: v })} />
    <Toggle label="Source color" active={params.isColor ?? true} onClick={() => onChange({ isColor: !(params.isColor ?? true) })} />
  </>
);
