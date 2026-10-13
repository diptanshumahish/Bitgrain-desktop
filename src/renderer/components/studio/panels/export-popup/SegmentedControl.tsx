import React from "react";

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

type SegmentTone = "accent" | "solid";

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  tone: SegmentTone;
}

const ACTIVE_CLASS: Record<SegmentTone, string> = {
  accent: "bg-[var(--s-accent)] text-[var(--s-accent-text)]",
  solid: "bg-[var(--s-text)] text-[var(--s-bg-panel)]",
};

const IDLE_CLASS = "bg-transparent text-[var(--s-text-muted)]";
const DIVIDER_CLASS = "border-r border-[var(--s-border)]";

export const SegmentedControl = <T extends string>({
  options,
  value,
  onSelect,
  tone,
}: SegmentedControlProps<T>): React.ReactElement => (
  <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
    {options.map((option, index) => (
      <button
        key={option.value}
        onClick={() => onSelect(option.value)}
        className={`flex-1 py-1 border-none cursor-pointer text-[10.5px] font-semibold font-inherit transition-colors ${
          index < options.length - 1 ? DIVIDER_CLASS : ""
        } ${value === option.value ? ACTIVE_CLASS[tone] : IDLE_CLASS}`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
