import React from "react";
import { Toggle } from "../../../../components/studio/ui/panelPrimitives";

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[11.5px] text-[var(--s-text)]">{label}</span>
    <Toggle value={value} onChange={onChange} />
  </div>
);
