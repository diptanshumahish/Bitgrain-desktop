import React from "react";
import { Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";

interface FeatureToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const FeatureToggleRow: React.FC<FeatureToggleRowProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-[12px] text-[var(--s-text-subtle)] font-medium">{label}</span>
    <Toggle label={label} value={value} onChange={onChange} />
  </div>
);
