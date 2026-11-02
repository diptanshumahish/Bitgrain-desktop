import React from "react";

export interface MobileChoice<T extends string> {
  value: T;
  label: string;
  detail: string;
}

interface MobileChoiceGroupProps<T extends string> {
  title: string;
  choices: MobileChoice<T>[];
  value: T;
  onSelect: (value: T) => void;
}

export const MobileChoiceGroup = <T extends string>({ title, choices, value, onSelect }: MobileChoiceGroupProps<T>): React.ReactElement => (
  <fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
    <legend className="mb-2 text-[13px] font-medium text-[var(--s-text-muted)]">{title}</legend>
    <div className="flex gap-2">
      {choices.map((choice) => {
        const active = choice.value === value;
        return (
          <button
            key={choice.value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(choice.value)}
            className={`flex-1 min-w-0 flex flex-col items-start justify-center gap-0.5 min-h-[56px] px-3 rounded-xl border text-left transition-colors ${
              active
                ? "border-[var(--s-border-selected)] bg-[var(--s-accent-soft)]"
                : "border-[var(--s-border)] bg-[var(--s-bg-input)]"
            }`}
          >
            <span className="text-[14px] font-semibold text-[var(--s-text)]">{choice.label}</span>
            <span className="truncate max-w-full text-[12px] text-[var(--s-text-muted)] tabular-nums">{choice.detail}</span>
          </button>
        );
      })}
    </div>
  </fieldset>
);
