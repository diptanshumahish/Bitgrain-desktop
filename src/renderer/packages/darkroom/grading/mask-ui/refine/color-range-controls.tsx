import React from "react";
import { Pipette } from "lucide-react";
import { Slider } from "@bitgrain/ui/controls/panel/slider";
import type { ColorRange } from "@bitgrain/engine/grading/mask/mask-types";
import { ToggleRow } from "./toggle-row";
import { hexToRgb, rgbToHex } from "./rgb-hex";
import { canPickScreenColor, pickScreenColor } from "./eye-dropper";
import { Button } from "@bitgrain/ui/components/Button";

interface ColorRangeControlsProps {
  range: ColorRange;
  onChange: (range: ColorRange) => void;
  onCommit?: () => void;
}

const PERCENT_MAX = 100;

export const ColorRangeControls: React.FC<ColorRangeControlsProps> = ({ range, onChange, onCommit }) => {
  const applyHex = (hex: string): void => {
    const color = hexToRgb(hex);
    if (!color) return;
    onChange({ ...range, color });
    onCommit?.();
  };

  const pickFromScreen = async (): Promise<void> => {
    try {
      const hex = await pickScreenColor();
      if (hex) applyHex(hex);
    } catch (error) {
      console.error("color pick failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <ToggleRow
        label="By color"
        value={range.enabled}
        onChange={(enabled) => {
          onChange({ ...range, enabled });
          onCommit?.();
        }}
      />
      {range.enabled && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Mask color"
              value={rgbToHex(range.color)}
              onChange={(event) => applyHex(event.target.value)}
              className="w-8 h-7 rounded-md border border-[var(--s-border)] bg-transparent cursor-pointer p-0.5"
            />
            <span className="text-[11px] text-[var(--s-text-muted)] tabular-nums">{rgbToHex(range.color)}</span>
            {canPickScreenColor() && (
              <Button size="xs" onClick={() => void pickFromScreen()} className="ml-auto">
                <Pipette size={11} strokeWidth={2} /> pick
              </Button>
            )}
          </div>
          <Slider label="Range" value={range.tolerance} max={PERCENT_MAX} onChange={(tolerance) => onChange({ ...range, tolerance })} onCommit={onCommit} />
          <Slider label="Softness" value={range.softness} max={PERCENT_MAX} onChange={(softness) => onChange({ ...range, softness })} onCommit={onCommit} />
        </>
      )}
    </div>
  );
};
