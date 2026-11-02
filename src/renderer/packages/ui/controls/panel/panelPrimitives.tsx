import React from "react";
import { Tooltip } from "./Tooltip";
import { Slider } from "./slider";

export const OpacityRow: React.FC<{
  value: number;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => (
  <Slider
    label="Opacity"
    value={Math.round(value * 100)}
    min={0}
    max={100}
    suffix="%"
    onChange={(v) => onChange(v / 100)}
  />
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
      className={`w-6 h-6 rounded-md border-none cursor-pointer flex items-center justify-center text-[12px] transition-all duration-100 ${
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
  label?: string;
}> = ({ value, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    aria-label={label}
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
        className={`flex-1 h-[26px] rounded-md border-none cursor-pointer flex items-center justify-center text-[12px] font-editorial font-semibold transition-all duration-100 ${
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

export { ScrubField } from "./scrub-field/scrub-field";
