import React, { useEffect, useRef, useState } from "react";

interface EditableValueProps {
  value: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  decimals?: number;
  scale?: number;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_SCALE = 1;
const DEFAULT_STEP = 1;
const PRECISION_DIGITS = 6;

const snapToStep = (raw: number, step: number, min: number, max: number): number => {
  const stepped = Math.round(raw / step) * step;
  const clamped = Math.min(max, Math.max(min, stepped));
  return parseFloat(clamped.toFixed(PRECISION_DIGITS));
};

export const EditableValue: React.FC<EditableValueProps> = ({
  value,
  onChange,
  onCommit,
  min,
  max,
  step = DEFAULT_STEP,
  suffix = "",
  decimals = 0,
  scale = DEFAULT_SCALE,
  disabled,
  className = "text-[9px]",
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const base = value * scale;
  const numberText = decimals > 0 ? base.toFixed(decimals) : String(Math.round(base));

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) onChange(snapToStep(parsed / scale, step, min, max));
    onCommit?.();
    setEditing(false);
  };

  const sharedClass = `${className} w-full text-right [font-variant-numeric:tabular-nums]`;

  if (disabled) {
    return <span className={`${sharedClass} select-none`}>{numberText}{suffix}</span>;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          else if (event.key === "Escape") setEditing(false);
        }}
        className={`${sharedClass} bg-[var(--s-bg-input)] text-[var(--s-text)] rounded px-0.5 outline-none ring-1 ring-[var(--s-accent)] border-none`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(numberText);
        setEditing(true);
      }}
      className={`${sharedClass} text-[var(--s-text-subtle)] hover:text-[var(--s-text)] cursor-text select-none bg-transparent border-none p-0`}
    >
      {numberText}{suffix}
    </button>
  );
};
