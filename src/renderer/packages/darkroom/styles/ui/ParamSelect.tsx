import React from "react";
import type { SelectParamSpec } from "@bitgrain/engine/styles/engine/style-types";

const MAX_INLINE_OPTIONS = 4;
const MAX_INLINE_LETTERS = 22;

const fitsInline = (spec: SelectParamSpec): boolean =>
  spec.options.length <= MAX_INLINE_OPTIONS && spec.options.reduce((total, option) => total + option.label.length, 0) <= MAX_INLINE_LETTERS;

interface ParamSelectProps {
  spec: SelectParamSpec;
  value: string;
  onChange: (value: string) => void;
}

const InlineOptions: React.FC<ParamSelectProps> = ({ spec, value, onChange }) => (
  <div role="radiogroup" aria-label={spec.label} className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5">
    {spec.options.map((option) => (
      <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={option.value === value}
        onClick={() => option.value !== value && onChange(option.value)}
        className={`flex-1 min-w-0 h-7 px-1.5 rounded truncate text-[12px] font-medium transition-colors ${option.value === value ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]" : "text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)]"}`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const DropdownOptions: React.FC<ParamSelectProps> = ({ spec, value, onChange }) => (
  <select
    aria-label={spec.label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="w-full h-7 px-2 rounded-md bg-[var(--s-bg-input)] text-[12px] text-[var(--s-text)] border border-[var(--s-border)] outline-none"
  >
    {spec.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
);

export const ParamSelect: React.FC<ParamSelectProps> = (props) => (
  <div className="grid grid-cols-[80px_1fr] items-center gap-2 px-2">
    <span className="text-[12px] text-[var(--s-text-muted)] select-none">{props.spec.label}</span>
    {fitsInline(props.spec) ? <InlineOptions {...props} /> : <DropdownOptions {...props} />}
  </div>
);
