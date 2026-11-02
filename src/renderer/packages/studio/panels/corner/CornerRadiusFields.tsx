import React from "react";
import { Scan } from "lucide-react";
import type { CornerRadii } from "@bitgrain/studio-core/model/paint-types";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { CornerIcon, SmoothingIcon, type CornerPosition } from "./corner-icons";

const MAX_RADIUS = 400;
const PERCENT = 100;
const TOGGLE_ICON_SIZE = 13;
const TOGGLE_ICON_STROKE = 1.75;
const CORNERS: CornerPosition[] = ["top-left", "top-right", "bottom-right", "bottom-left"];
const CORNER_TITLES: Record<CornerPosition, string> = {
  "top-left": "Top left roundness",
  "top-right": "Top right roundness",
  "bottom-right": "Bottom right roundness",
  "bottom-left": "Bottom left roundness",
};

interface CornerValues {
  borderRadius?: number;
  cornerRadii?: CornerRadii;
  cornerSmoothing?: number;
}

interface CornerRadiusFieldsProps {
  radius: number;
  radii?: CornerRadii;
  smoothing?: number;
  onChange: (updates: CornerValues) => void;
}

const replaceCorner = (radii: CornerRadii, index: number, value: number): CornerRadii =>
  radii.map((radius, cornerIndex) => (cornerIndex === index ? value : radius)) as CornerRadii;

export const CornerRadiusFields: React.FC<CornerRadiusFieldsProps> = ({ radius, radii, smoothing = 0, onChange }) => {
  const toggleIndependent = (): void => {
    if (radii) {
      onChange({ borderRadius: radii[0], cornerRadii: undefined });
      return;
    }
    onChange({ cornerRadii: [radius, radius, radius, radius] });
  };

  const smoothingField = (
    <ScrubField
      label={<SmoothingIcon />}
      title="Corner smoothing, softens how rounded corners curve"
      value={Math.round(smoothing)}
      min={0}
      max={PERCENT}
      suffix="%"
      onChange={(value) => onChange({ cornerSmoothing: value })}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {radii ? (
          <div className="grid grid-cols-2 gap-2 flex-1">
            {CORNERS.map((corner, index) => (
              <ScrubField key={corner} title={CORNER_TITLES[corner]} label={<CornerIcon corner={corner} />} value={radii[index]} min={0} max={MAX_RADIUS} onChange={(value) => onChange({ cornerRadii: replaceCorner(radii, index, value) })} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 flex-1">
            <ScrubField title="Corner roundness" label={<CornerIcon corner="top-left" />} value={radius} min={0} max={MAX_RADIUS} onChange={(value) => onChange({ borderRadius: value })} />
            {smoothingField}
          </div>
        )}
        <button
          type="button"
          title={radii ? "Use one radius" : "Set each corner"}
          aria-pressed={Boolean(radii)}
          onClick={toggleIndependent}
          className={`w-8 h-[28px] rounded-md border flex items-center justify-center transition-colors shrink-0 self-start ${
            radii
              ? "border-[var(--s-accent)] text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
              : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
          }`}
        >
          <Scan size={TOGGLE_ICON_SIZE} strokeWidth={TOGGLE_ICON_STROKE} />
        </button>
      </div>
      {radii && <div className="grid grid-cols-2 gap-2 pr-10">{smoothingField}</div>}
    </div>
  );
};
