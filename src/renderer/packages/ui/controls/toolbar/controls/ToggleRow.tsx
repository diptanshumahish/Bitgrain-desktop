import React from "react";
import { ToggleSwitch } from "./ToggleSwitch";

interface ToggleRowProps {
  label: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, hint, checked, onChange }) => (
  <div className="flex items-center justify-between gap-3 px-2 py-1">
    <span className="min-w-0">
      <span className="block text-[12px] font-medium leading-tight text-[var(--s-text)]">{label}</span>
      <span className="block truncate text-[12px] text-[var(--s-text-subtle)] leading-tight mt-0.5">{hint}</span>
    </span>
    <ToggleSwitch checked={checked} onChange={onChange} label={label} />
  </div>
);
