import React from "react";

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: SegmentedProps<T>): React.ReactElement {
  return (
    <div className="flex gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-2 rounded-md text-[11px] font-mono font-bold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              active
                ? "bg-[var(--s-text)] text-[var(--s-bg-panel)] border-[var(--s-text)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] border-[var(--s-border)] hover:text-[var(--s-text)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
