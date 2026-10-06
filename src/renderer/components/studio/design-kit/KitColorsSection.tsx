import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { emitPopover } from "../../../lib/event-bus";
import { NameField, ApplyButton } from "./kit-row-controls";
import type { ColorVariable } from "../../../data/design-kit-types";
import { newId } from "../../../data/design-kit-types";
import { addColor, updateColor, removeColor } from "../../../store/design-kits-store";

const ColorRow: React.FC<{
  color: ColorVariable;
  canApply: boolean;
  onVariableColorChange: (varId: string, hex: string) => void;
  onApply: (variable: ColorVariable) => void;
}> = ({ color, canApply, onVariableColorChange, onApply }) => {
  const openPicker = (event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    emitPopover({
      type: "color-picker",
      color: color.value,
      onChange: (next) => onVariableColorChange(color.id, next),
      anchorRect: rect,
    });
  };
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={openPicker}
        title="Edit variable color"
        className="w-6 h-6 rounded-md border border-[var(--s-border)] shrink-0 cursor-pointer"
        style={{ background: color.value }}
      />
      <NameField value={color.name} onCommit={(name) => updateColor(color.id, { name })} />
      <ApplyButton enabled={canApply} title="Bind to selection" onClick={() => onApply(color)} />
      <button
        onClick={() => removeColor(color.id)}
        title="Remove"
        className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
      >
        <Trash2 size={11} strokeWidth={1.75} />
      </button>
    </div>
  );
};

interface KitColorsSectionProps {
  colors: ColorVariable[];
  prefillColor?: string;
  canApply: boolean;
  onVariableColorChange: (varId: string, hex: string) => void;
  onApply: (variable: ColorVariable) => void;
}

export const KitColorsSection: React.FC<KitColorsSectionProps> = ({
  colors, prefillColor, canApply, onVariableColorChange, onApply,
}) => (
  <div className="flex flex-col gap-1.5 px-3 py-2.5 border-t border-[var(--s-border)]">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold text-[var(--s-text-muted)]">Colors</span>
      <button
        onClick={() =>
          addColor({ id: newId(), name: `Color ${colors.length + 1}`, value: prefillColor ?? "#820000" })
        }
        title="Add color"
        className="w-5 h-5 rounded-md flex items-center justify-center bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)] transition-colors"
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
    {colors.length === 0 ? (
      <p className="text-[10px] text-[var(--s-text-subtle)] py-1">No colors yet.</p>
    ) : (
      colors.map((color) => (
        <ColorRow
          key={color.id}
          color={color}
          canApply={canApply}
          onVariableColorChange={onVariableColorChange}
          onApply={onApply}
        />
      ))
    )}
  </div>
);
