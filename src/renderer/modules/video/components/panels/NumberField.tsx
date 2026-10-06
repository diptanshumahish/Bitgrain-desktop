import React, { useState } from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  unit?: string;
  onCommit: (value: number) => void;
}

function format(value: number): string {
  return String(Math.round(value * 100) / 100);
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  step,
  min,
  max,
  unit,
  onCommit,
}) => {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (raw: string): void => {
    setDraft(null);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    let next = parsed;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    onCommit(next);
  };

  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] text-[var(--s-text-muted)]">
        {label}
        {unit ? ` (${unit})` : ""}
      </span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={draft ?? format(value)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-full rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] px-2 py-1 text-[11px] text-[var(--s-text)] tabular-nums focus:border-[var(--s-accent)] focus:outline-none"
      />
    </label>
  );
};
