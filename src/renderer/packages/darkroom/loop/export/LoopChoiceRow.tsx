import React from "react";

interface LoopChoice<T extends string | number> {
  id: T;
  label: string;
}

interface LoopChoiceRowProps<T extends string | number> {
  label: string;
  choices: readonly LoopChoice<T>[];
  value: T;
  disabled: boolean;
  onChange: (value: T) => void;
}

const ACTIVE_CLASS = "bg-[var(--s-bg-panel)] text-[var(--s-text)]";
const IDLE_CLASS = "text-[var(--s-text-subtle)] hover:text-[var(--s-text-muted)]";

export const LoopChoiceRow = <T extends string | number>({
  label, choices, value, disabled, onChange,
}: LoopChoiceRowProps<T>): React.ReactElement => (
  <div className="flex items-center justify-between gap-3 px-2 min-h-8">
    <span className="text-[12px] text-[var(--s-text-muted)]">{label}</span>
    <div role="group" aria-label={label} className="flex items-center gap-px rounded-md bg-[var(--s-bg-input)] p-0.5">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          disabled={disabled}
          aria-pressed={value === choice.id}
          onClick={() => onChange(choice.id)}
          className={`h-6 px-2.5 text-[12px] font-medium rounded tabular-nums transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${value === choice.id ? ACTIVE_CLASS : IDLE_CLASS}`}
        >
          {choice.label}
        </button>
      ))}
    </div>
  </div>
);
