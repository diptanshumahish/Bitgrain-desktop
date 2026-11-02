import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { AsciiTone } from "../../../engine/types";
import {
  ASCII_DETAILED,
  ASCII_CODE,
  ASCII_STANDARD,
  ASCII_BLOCKS,
} from "../../../engine/plugins/ascii";

interface AsciiPopoverProps {
  charset: string;
  setCharset: (v: string) => void;
  tone: AsciiTone;
  setTone: (v: AsciiTone) => void;
  density: number;
  setDensity: (v: number) => void;
  edges: boolean;
  setEdges: (v: boolean) => void;
  edgeThreshold: number;
  setEdgeThreshold: (v: number) => void;
  isColor: boolean;
  toggleColor: () => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const PRESETS: { label: string; value: string }[] = [
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
  `px-2 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
    active
      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
      : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
  }`;

export const AsciiPopover: React.FC<AsciiPopoverProps> = ({
  charset,
  setCharset,
  tone,
  setTone,
  density,
  setDensity,
  edges,
  setEdges,
  edgeThreshold,
  setEdgeThreshold,
  isColor,
  toggleColor,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => (
  <Popover onClose={onClose} className="w-56" static={isStatic}>
    <PopoverSection title="Characters">
      <div className="grid grid-cols-2 gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setCharset(preset.value);
              onStateChangeFinished();
            }}
            className={optionClass(charset === preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={charset}
        onChange={(event) => setCharset(event.target.value)}
        onBlur={onStateChangeFinished}
        spellCheck={false}
        placeholder="Custom characters"
        className="mt-1.5 w-full font-mono text-[12px] bg-[var(--s-bg-input)] text-[var(--s-text)] border border-[var(--s-border)] rounded-lg px-2 py-1.5 outline-none focus:border-[var(--s-accent)] transition-colors"
      />
      <p className="text-[12px] text-[var(--s-text-subtle)] mt-1 px-0.5">
        Sparse to dense, left to right.
      </p>
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title="Tone">
      <div className="grid grid-cols-2 gap-1">
        {TONES.map((item) => (
          <button
            key={item.value}
            onClick={() => {
              setTone(item.value);
              onStateChangeFinished();
            }}
            className={optionClass(tone === item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title="Detail">
      <div className="grid grid-cols-[1fr_28px] items-center gap-x-2 px-1">
        <Slider
          label="Detail"
          min={0.4}
          max={2.5}
          step={0.1}
          value={density}
          onChange={setDensity}
          onDone={onStateChangeFinished}
        />
        <EditableValue
          value={density}
          min={0.4}
          max={2.5}
          step={0.1}
          decimals={1}
          suffix="x"
          onChange={setDensity}
          onCommit={onStateChangeFinished}
        />
      </div>
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title="Edges">
      <button
        onClick={() => {
          setEdges(!edges);
          onStateChangeFinished();
        }}
        className={`w-full ${optionClass(edges)}`}
      >
        {edges ? "Edge glyphs on" : "Edge glyphs off"}
      </button>
      {edges && (
        <div className="grid grid-cols-[1fr_28px] items-center gap-x-2 px-1 mt-1.5">
          <Slider
            label="Edge threshold"
            min={0}
            max={1}
            step={0.05}
            value={edgeThreshold}
            onChange={setEdgeThreshold}
            onDone={onStateChangeFinished}
          />
          <EditableValue
            value={edgeThreshold}
            min={0}
            max={1}
            step={0.05}
            scale={100}
            suffix="%"
            onChange={setEdgeThreshold}
            onCommit={onStateChangeFinished}
          />
        </div>
      )}
    </PopoverSection>

    <div className="h-px bg-[var(--s-border)] opacity-50" />
    <PopoverSection title="Color">
      <button
        onClick={toggleColor}
        className={`w-full ${optionClass(isColor)}`}
      >
        {isColor ? "Source color on" : "Source color off"}
      </button>
    </PopoverSection>
  </Popover>
);
