import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "./dropdown";
import { Tooltip } from "./Tooltip";
import { Slider } from "./slider";
import { BLEND_MODE_OPTIONS } from "./blend-modes";

export const OpacityRow: React.FC<{
  value: number;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => (
  <Slider
    label="opacity"
    value={Math.round(value * 100)}
    min={0}
    max={100}
    suffix="%"
    onChange={(v) => onChange(v / 100)}
  />
);

export const PositionGrid: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  onXChange: (v: number) => void;
  onYChange: (v: number) => void;
  onWChange: (v: number) => void;
  onHChange: (v: number) => void;
  minDim?: number;
}> = ({
  x,
  y,
  width,
  height,
  onXChange,
  onYChange,
  onWChange,
  onHChange,
  minDim = 10,
}) => (
  <div className="grid grid-cols-2 gap-2">
    <ScrubField label="X" value={x} onChange={onXChange} />
    <ScrubField label="Y" value={y} onChange={onYChange} />
    <ScrubField label="W" value={width} min={minDim} onChange={onWChange} />
    <ScrubField label="H" value={height} min={minDim} onChange={onHChange} />
  </div>
);

export const Section: React.FC<{
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  dimTitle?: boolean;
}> = ({ title, right, children, dimTitle }) => (
  <div className="flex flex-col border-b border-[var(--s-border)] last:border-none">
    <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
      <span
        className={`text-[11px] font-medium ${
          dimTitle ? "text-[var(--s-text-subtle)]" : "text-[var(--s-text)]"
        }`}
      >
        {title}
      </span>
      {right && <div className="flex items-center gap-1.5">{right}</div>}
    </div>
    <div className="px-3 pb-3 flex flex-col gap-2">{children}</div>
  </div>
);

export const Row: React.FC<{
  cols?: number;
  gap?: number;
  children: React.ReactNode;
}> = ({ cols = 2, gap = 6, children }) => (
  <div
    className="grid"
    style={{
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: `${gap}px`,
    }}
  >
    {children}
  </div>
);

export const SmallBtn: React.FC<{
  onClick?: () => void;
  title?: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, active, children }) => {
  const btn = (
    <button
      onClick={onClick}
      className={`w-6 h-6 rounded-md border-none cursor-pointer flex items-center justify-center text-[10px] transition-all duration-100 ${
        active
          ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
          : "bg-[var(--s-bg-input)] text-[var(--s-text-subtle)]"
      }`}
    >
      {children}
    </button>
  );
  if (title) return <Tooltip content={title}>{btn}</Tooltip>;
  return btn;
};

export const Toggle: React.FC<{
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`w-[30px] h-[17px] rounded-full border-none cursor-pointer relative shrink-0 transition-all duration-200 ${
      value ? "bg-[var(--s-accent)]" : "bg-[var(--s-bg-input)]"
    }`}
  >
    <div
      className={`absolute top-[2.5px] w-3 h-3 rounded-full transition-all duration-150 ${
        value
          ? "left-[15px] bg-[var(--s-accent-text)]"
          : "left-[2.5px] bg-[var(--s-text-muted)]"
      }`}
    />
  </button>
);

export const BtnGroup: React.FC<{
  options: Array<{
    icon?: React.ReactNode;
    label?: string;
    value: string;
    title?: string;
  }>;
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="flex gap-[2px] bg-[var(--s-bg-input)] rounded-lg p-0.5">
    {options.map((opt) => (
      <button
        key={opt.value}
        title={opt.title}
        onClick={() => onChange(opt.value)}
        className={`flex-1 h-[26px] rounded-md border-none cursor-pointer flex items-center justify-center text-[10px] font-editorial font-semibold transition-all duration-100 ${
          opt.value === value
            ? "bg-[var(--s-bg-panel)] text-[var(--s-accent)]"
            : "bg-transparent text-[var(--s-text-subtle)]"
        }`}
      >
        {opt.icon || opt.label}
      </button>
    ))}
  </div>
);

// ─── Figma-style scrub field ──────────────────────────────────────────────────
// Drag the label left/right to scrub the value. Click without dragging to edit.
// Shift = ×10 speed, Alt/Option = ×0.1 speed.

const DRAG_THRESHOLD_PX = 3;

export const ScrubField: React.FC<{
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
}> = ({
  label,
  value,
  onChange,
  onCommit,
  min,
  max,
  step = 1,
  suffix,
  decimals,
  disabled,
  compact,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const dragging = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startVal = useRef(0);
  const pointerId = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dp = decimals ?? (step < 1 ? (step < 0.1 ? 2 : 1) : 0);
  const safeValue = Number.isFinite(value) ? value : 0;
  const display = dp > 0 ? safeValue.toFixed(dp) : String(Math.round(safeValue));

  const clamp = (v: number) => {
    let r = v;
    if (min !== undefined) r = Math.max(min, r);
    if (max !== undefined) r = Math.min(max, r);
    return r;
  };

  const format = (n: number) => (dp > 0 ? n.toFixed(dp) : String(Math.round(n)));

  const beginEdit = () => {
    if (disabled) return;
    setDraft(display);
    setEditing(true);
  };

  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [editing]);

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n)) onChange(clamp(n));
    onCommit?.();
    setEditing(false);
  };

  const wrapClasses = compact
    ? `inline-flex items-center gap-0.5 rounded-md h-[21px] px-1.5 min-w-[42px] transition-colors duration-100 ${
        disabled
          ? "bg-transparent opacity-35"
          : "bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)]"
      }`
    : `flex items-center gap-2 rounded-md h-[28px] px-2 transition-all duration-100 ${
        disabled
          ? "bg-transparent opacity-35"
          : "bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)] opacity-100"
      }`;

  const valueClass = compact
    ? "text-[11px] text-[var(--s-text)] font-medium [font-variant-numeric:tabular-nums]"
    : "flex-1 text-[11px] text-[var(--s-text)] font-medium";

  const inputClass = compact
    ? "bg-transparent border-none outline-none text-[11px] text-[var(--s-text)] [font-variant-numeric:tabular-nums] w-[30px] min-w-0"
    : "flex-1 bg-transparent border-none outline-none text-[11.5px] text-[var(--s-text)] w-0 min-w-[3rem]";

  if (editing && !disabled) {
    return (
      <div className={`${wrapClasses} ring-1.5 ring-[var(--s-accent)]`}>
        {label && (
          <span className="text-[10px] text-[var(--s-text-subtle)] shrink-0 select-none font-medium pr-1">
            {label}
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
              return;
            }
            if (e.key === "Escape") {
              setEditing(false);
              return;
            }
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              const next = clamp(parseFloat(draft || "0") + (e.key === "ArrowUp" ? step : -step));
              setDraft(format(next));
              onChange(next);
            }
          }}
          className={inputClass}
        />
        {suffix && (
          <span className="text-[10px] text-[var(--s-text-subtle)] shrink-0">
            {suffix}
          </span>
        )}
      </div>
    );
  }

  const scrubHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled) return;
      dragging.current = true;
      moved.current = false;
      startX.current = e.clientX;
      startVal.current = safeValue;
      pointerId.current = e.pointerId;
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      if (!moved.current && Math.abs(delta) > DRAG_THRESHOLD_PX) {
        moved.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      if (moved.current) {
        const speed = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
        onChange(clamp(startVal.current + delta * step * speed));
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      if (moved.current && pointerId.current !== null) {
        (e.currentTarget as HTMLElement).releasePointerCapture(pointerId.current);
        onCommit?.();
      }
      pointerId.current = null;
    },
  };

  return (
    <div className={`${wrapClasses} select-none`}>
      {label && (
        <span
          {...scrubHandlers}
          className={`text-[10px] text-[var(--s-text-subtle)] shrink-0 font-medium pr-1 ${
            disabled ? "cursor-default" : "cursor-ew-resize"
          }`}
        >
          {label}
        </span>
      )}
      <span
        className={`${valueClass} ${
          disabled ? "cursor-default" : label ? "cursor-text" : "cursor-ew-resize"
        }`}
        onClick={() => {
          if (!moved.current) beginEdit();
        }}
        {...(label ? {} : scrubHandlers)}
      >
        {display}
      </span>
      {suffix && (
        <span className="text-[10px] text-[var(--s-text-subtle)] shrink-0">
          {suffix}
        </span>
      )}
    </div>
  );
};

export const BlendModeSelector: React.FC<{
  value?: string;
  onChange: (v: string) => void;
}> = ({ value = "normal", onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <span className="  text-[9px]     text-[var(--s-text-subtle)] px-0.5">
        Blend Mode
      </span>
      <Dropdown options={BLEND_MODE_OPTIONS} value={value} onChange={onChange} />
    </div>
  );
};
