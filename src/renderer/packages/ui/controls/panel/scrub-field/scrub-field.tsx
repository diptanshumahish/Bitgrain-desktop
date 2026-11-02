import React, { useEffect, useRef, useState } from "react";
import { useScrubDrag } from "./use-scrub-drag";
import { useCommitOnOutsidePress } from "../../../hooks/use-commit-on-outside-press";
import {
  FOCUS_RING_CLASS,
  LABEL_CLASS,
  SUFFIX_CLASS,
  inputClassFor,
  valueClassFor,
  wrapClassFor,
} from "./scrub-field-styles";

interface ScrubFieldProps {
  label: string | React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  decimals?: number;
  disabled?: boolean;
  compact?: boolean;
  mixed?: boolean;
  title?: string;
}

const decimalsFor = (step: number, decimals?: number): number => {
  if (decimals !== undefined) return decimals;
  if (step >= 1) return 0;
  return step < 0.1 ? 2 : 1;
};

const formatNumber = (value: number, places: number): string =>
  places > 0 ? value.toFixed(places) : String(Math.round(value));

const clampBetween = (value: number, min?: number, max?: number): number => {
  const lowered = min !== undefined ? Math.max(min, value) : value;
  return max !== undefined ? Math.min(max, lowered) : lowered;
};

const isEditKey = (key: string): boolean => key === "Enter" || key === " ";

export const ScrubField: React.FC<ScrubFieldProps> = ({
  label, value, onChange, onCommit, min, max, step = 1, suffix, decimals, disabled, compact, mixed, title,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);
  const places = decimalsFor(step, decimals);
  const safeValue = Number.isFinite(value) ? value : 0;
  const display = formatNumber(safeValue, places);
  const clamp = (next: number): number => clampBetween(next, min, max);
  const drag = useScrubDrag({ disabled, value: safeValue, step, clamp, onChange, onCommit });
  const accessibleName = title ?? (typeof label === "string" ? label : undefined);

  const beginEdit = (): void => {
    if (disabled) return;
    committedRef.current = false;
    setDraft(mixed ? "" : display);
    setEditing(true);
  };

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const commit = (): void => {
    if (committedRef.current) return;
    committedRef.current = true;
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) onChange(clamp(parsed));
    onCommit?.();
    setEditing(false);
  };

  const cancelEdit = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    committedRef.current = true;
    setEditing(false);
  };

  useCommitOnOutsidePress(editing, inputRef, commit);

  const nudge = (direction: number): void => {
    const next = clamp(parseFloat(draft || "0") + direction * step);
    setDraft(formatNumber(next, places));
    onChange(next);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") return commit();
    if (event.key === "Escape") return cancelEdit(event);
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    nudge(event.key === "ArrowUp" ? 1 : -1);
  };

  const onValueClick = (): void => {
    const scrubbed = label ? false : drag.consumeScrub();
    if (!scrubbed) beginEdit();
  };

  const onValueKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>): void => {
    if (!isEditKey(event.key)) return;
    event.preventDefault();
    beginEdit();
  };

  if (editing && !disabled) {
    return (
      <div className={`${wrapClassFor(compact, disabled)} ring-1.5 ring-[var(--s-accent)]`} title={title}>
        {label && <span className={LABEL_CLASS}>{label}</span>}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          aria-label={accessibleName}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={onInputKeyDown}
          className={inputClassFor(compact)}
        />
        {suffix && <span className={SUFFIX_CLASS}>{suffix}</span>}
      </div>
    );
  }

  const cursor = disabled ? "cursor-default" : label ? "cursor-text" : "cursor-ew-resize";

  return (
    <div className={`${wrapClassFor(compact, disabled)} select-none`} title={title}>
      {label && (
        <span {...drag.handlers} className={`${LABEL_CLASS} ${disabled ? "cursor-default" : "cursor-ew-resize"}`}>
          {label}
        </span>
      )}
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={accessibleName ? `${accessibleName}, ${mixed ? "mixed" : display}` : undefined}
        className={`${valueClassFor(compact)} ${cursor} ${FOCUS_RING_CLASS}`}
        onClick={onValueClick}
        onKeyDown={onValueKeyDown}
        {...(label ? {} : drag.handlers)}
      >
        {mixed ? "Mixed" : display}
      </span>
      {suffix && <span className={SUFFIX_CLASS}>{suffix}</span>}
    </div>
  );
};
