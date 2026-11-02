import React, { useMemo } from "react";
import { generatePattern, type PatternKind } from "@bitgrain/studio-core/pattern/pattern-engine";
import { PATTERN_PRESETS, defaultParamsFor } from "./PatternPresets";
import { PatternPreview } from "./PatternPreview";

const TILE_SIZE = 86;

interface PatternPresetGridProps {
  active: PatternKind;
  onSelect: (kind: PatternKind) => void;
}

interface TileProps {
  kind: PatternKind;
  label: string;
  hint: string;
  active: boolean;
  onSelect: () => void;
}

const PresetTile: React.FC<TileProps> = ({ kind, label, hint, active, onSelect }) => {
  const layers = useMemo(() => generatePattern(defaultParamsFor(kind)), [kind]);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      title={hint}
      className={`group flex flex-col items-start gap-1.5 p-1.5 rounded-xl border transition-colors text-left ${
        active
          ? "border-[var(--s-accent)] bg-[var(--s-bg-input)]"
          : "border-[var(--s-border)] bg-transparent hover:bg-[var(--s-bg-input)]/60"
      }`}
    >
      <div className="pointer-events-none">
        <PatternPreview layers={layers} size={TILE_SIZE} />
      </div>
      <span
        className={`text-[11.5px] font-semibold leading-tight px-0.5 ${
          active ? "text-[var(--s-text)]" : "text-[var(--s-text-muted)] group-hover:text-[var(--s-text)]"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export const PatternPresetGrid: React.FC<PatternPresetGridProps> = ({ active, onSelect }) => (
  <div className="grid grid-cols-2 gap-1.5">
    {PATTERN_PRESETS.map((preset) => (
      <PresetTile
        key={preset.kind}
        kind={preset.kind}
        label={preset.label}
        hint={preset.hint}
        active={active === preset.kind}
        onSelect={() => onSelect(preset.kind)}
      />
    ))}
  </div>
);
