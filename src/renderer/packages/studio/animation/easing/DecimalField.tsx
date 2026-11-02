import React from "react";

interface DecimalFieldProps {
  label: string;
  value: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}

export const DecimalField: React.FC<DecimalFieldProps> = ({ label, value, disabled, onCommit }) => {
  const commit = (input: HTMLInputElement): void => {
    const parsed = Number(input.value);
    if (!Number.isFinite(parsed)) {
      input.value = String(value);
      return;
    }
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <label className="flex flex-col gap-0.5 text-[12px] text-[var(--s-text-subtle)] min-w-0">
      {label}
      <input
        key={value}
        type="text"
        inputMode="decimal"
        defaultValue={String(value)}
        disabled={disabled}
        onBlur={(event) => commit(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="w-full px-1.5 py-1 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] text-[12px] text-[var(--s-text)] tabular-nums outline-none disabled:opacity-40"
      />
    </label>
  );
};
