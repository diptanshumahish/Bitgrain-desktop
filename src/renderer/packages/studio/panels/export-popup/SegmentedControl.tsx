import React from "react";

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

type SegmentTone = "accent" | "solid";
type SegmentSizing = "equal" | "content";

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  tone: SegmentTone;
  sizing?: SegmentSizing;
}

const ACTIVE_CLASS: Record<SegmentTone, string> = {
  accent: "bg-[var(--s-accent)] text-[var(--s-accent-text)]",
  solid: "bg-[var(--s-text)] text-[var(--s-bg-panel)]",
};

const SIZING_CLASS: Record<SegmentSizing, string> = {
  equal: "flex-1",
  content: "flex-auto px-1.5 whitespace-nowrap",
};

const IDLE_CLASS = "bg-transparent text-[var(--s-text-muted)]";
const DIVIDER_CLASS = "border-r border-[var(--s-border)]";

export const SegmentedControl = <T extends string>({
  options,
  value,
  onSelect,
  tone,
  sizing = "equal",
}: SegmentedControlProps<T>): React.ReactElement => (
  <div className="flex border border-[var(--s-border)] rounded-lg overflow-hidden">
    {options.map((option, index) => (
      <button
        key={option.value}
        onClick={() => onSelect(option.value)}
        className={`${SIZING_CLASS[sizing]} py-1 border-none cursor-pointer text-[12px] font-semibold font-inherit transition-colors ${
          index < options.length - 1 ? DIVIDER_CLASS : ""
        } ${value === option.value ? ACTIVE_CLASS[tone] : IDLE_CLASS}`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
