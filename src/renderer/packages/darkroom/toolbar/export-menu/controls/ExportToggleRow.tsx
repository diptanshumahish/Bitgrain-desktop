import React from "react";
import { ToggleSwitch } from "@bitgrain/ui/controls/toolbar/controls/ToggleSwitch";

interface ExportToggleRowProps {
  label: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const ExportToggleRow: React.FC<ExportToggleRowProps> = ({ label, hint, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between gap-3 px-3 py-2.5">
    <span className="flex flex-col gap-0.5 min-w-0">
      <span className={`text-[12px] font-medium ${disabled ? "text-[var(--s-text-subtle)]" : "text-[var(--s-text)]"}`}>{label}</span>
      <span className="text-[12px] leading-snug text-[var(--s-text-subtle)]">{hint}</span>
    </span>
    <ToggleSwitch checked={checked} onChange={onChange} label={label} disabled={disabled} />
  </div>
);
