import React from "react";

export interface SegmentOption<Value extends string | boolean> {
  label: string;
  value: Value;
}

interface SegmentedControlProps<Value extends string | boolean> {
  label: string;
  options: SegmentOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

export const SegmentedControl = <Value extends string | boolean>({ label, options, value, onChange }: SegmentedControlProps<Value>): React.ReactElement => (
  <div role="radiogroup" aria-label={label} className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5">
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => !selected && onChange(option.value)}
          className={`flex-1 min-w-0 h-7 px-1.5 rounded truncate text-[12px] font-medium transition-colors ${selected ? "bg-[var(--s-bg-panel)] text-[var(--s-text)]" : "text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)]"}`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
