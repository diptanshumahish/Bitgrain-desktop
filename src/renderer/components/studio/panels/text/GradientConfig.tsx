import React from "react";
import type { TextLayer } from "../../../../data/studioTypes";
import { DEFAULT_GRADIENT_TEXT } from "../../../../data/studioTypes";
import { ColorPicker } from "../../ui/ColorPicker";
import { ScrubField } from "../../ui/panelPrimitives";

interface GradientConfigProps {
  layer: TextLayer;
  onChange: (u: Partial<TextLayer>) => void;
}

export const GradientConfig: React.FC<GradientConfigProps> = ({
  layer,
  onChange,
}) => {
  const g = { ...DEFAULT_GRADIENT_TEXT, ...layer.gradientText };
  const up = (p: Partial<typeof g>) =>
    onChange({ gradientText: { ...g, ...p } });

  return (
    <div className="flex flex-col gap-3 bg-[var(--s-bg-panel-alt)] border border-[var(--s-border)] rounded-lg p-3 mt-1 overflow-hidden">
      {/* Colors Row */}
      <div className="grid grid-cols-2 gap-2">
        {(["color1", "color2"] as const).map((key, i) => (
          <div key={key} className="flex flex-col gap-1.5">
            <span className="text-[9px] font-semibold text-[var(--s-text-muted)]    ">
              {i === 0 ? "From" : "To"}
            </span>
            <ColorPicker color={g[key]} onChange={(c) => up({ [key]: c })} />
          </div>
        ))}
      </div>

      {/* Angle Row */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-semibold text-[var(--s-text-muted)]    ">
          Angle
        </span>
        <div className="w-[80px]">
          <ScrubField
            label="°"
            value={g.angle}
            min={0}
            max={360}
            step={1}
            onChange={(v) => up({ angle: v })}
          />
        </div>
      </div>

      {/* Preview Row */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] font-semibold text-[var(--s-text-muted)]    ">
          Preview
        </span>
        <div
          className="h-2.5 rounded-full border border-black/5"
          style={{
            background: `linear-gradient(${g.angle}deg, ${g.color1}, ${g.color2})`,
          }}
        />
      </div>
    </div>
  );
};
