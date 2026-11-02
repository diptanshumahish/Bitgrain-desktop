import React from "react";
import { BoxSelect } from "lucide-react";
import { SwitchRow } from "../../../panels/export-popup/SwitchRow";

interface SelectionScopeRowProps {
  layerCount: number;
  checked: boolean;
  onToggle: () => void;
}

export const SelectionScopeRow: React.FC<SelectionScopeRowProps> = ({ layerCount, checked, onToggle }) => (
  <div className="flex flex-col -mx-3">
    <SwitchRow
      icon={BoxSelect}
      label="Selection only"
      hint={`Export just the ${layerCount === 1 ? "selected layer" : `${layerCount} selected layers`}, cropped to fit`}
      checked={checked}
      onToggle={onToggle}
    />
  </div>
);
