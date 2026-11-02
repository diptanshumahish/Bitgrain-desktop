import React from "react";
import { HalftoneLabel } from "./HalftoneLabel";

interface SegmentOption<Value extends string> {
  id: Value;
  label: string;
}

interface HalftoneSegmentedProps<Value extends string> {
  label: string;
  tip: string;
  options: readonly SegmentOption<Value>[];
  value: Value;
  onSelect: (value: Value) => void;
}

export const HalftoneSegmented = <Value extends string>({
  label,
  tip,
  options,
  value,
  onSelect,
}: HalftoneSegmentedProps<Value>): React.ReactElement => (
  <div className="grid grid-cols-[64px_1fr] items-center gap-2">
    <HalftoneLabel text={label} tip={tip} />
    <div className="flex flex-wrap items-center gap-1">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`flex-1 min-w-fit px-1.5 py-1 rounded-md text-[12px] font-medium transition-all ${
            value === option.id
              ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
              : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
