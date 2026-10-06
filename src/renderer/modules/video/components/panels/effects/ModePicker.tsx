import React from "react";
import type { TransformMode } from "../../../types";
import { ALL_MODES } from "./mode-options";
import { SelectMenu } from "../../ui/SelectMenu";

interface ModePickerProps {
  value: TransformMode;
  onChange: (mode: TransformMode) => void;
  className?: string;
}

export const ModePicker: React.FC<ModePickerProps> = ({ value, onChange, className }) => {
  const options = ALL_MODES.map((mode) => ({
    value: mode.id,
    label: mode.label,
    group: mode.group,
    glyph: mode.glyph,
  }));

  return (
    <SelectMenu
      value={value}
      options={options}
      onChange={(next) => onChange(next as TransformMode)}
      ariaLabel="Effect mode"
      className={className}
    />
  );
};
