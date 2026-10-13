import React from "react";
import { Check } from "lucide-react";
import type { DashStyle, VectorSettings } from "../../../../data/studioTypes";
import { BtnGroup, ScrubField } from "../../ui/panelPrimitives";
import { DashStyleIcon } from "../../panels/vector/stroke-icons";
import { PaintChip } from "./PaintChip";

interface DrawingSettingsBarProps {
  penMode: boolean;
  settings: VectorSettings;
  onChange: (settings: Partial<VectorSettings>) => void;
  onDone: () => void;
}

const MIN_STROKE = 0.5;
const MAX_STROKE = 200;
const PEN_HINT = "Click to add points, drag to curve, Enter to finish";
const DRAW_HINT = "Draw freely, each stroke becomes its own layer";

const DASH_STYLES: { value: DashStyle; title: string }[] = [
  { value: "solid", title: "Solid" },
  { value: "dashed", title: "Dashed" },
  { value: "dotted", title: "Dotted" },
];

const hasPaint = (color: string): boolean => color !== "transparent" && color !== "none";

export const DrawingSettingsBar: React.FC<DrawingSettingsBarProps> = ({ penMode, settings, onChange, onDone }) => (
  <div className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
    <span className="text-[11px] text-[var(--s-text-subtle)] px-2.5 py-1 rounded-md bg-[var(--s-bg-panel)]/80 backdrop-blur-md">
      {penMode ? PEN_HINT : DRAW_HINT}
    </span>
    <div className="flex items-center gap-1.5 bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-2xl p-1.5">
      <PaintChip label="Stroke" color={settings.strokeColor} onChange={(strokeColor) => onChange({ strokeColor })} />
      {penMode && (
        <PaintChip
          label="Fill"
          color={hasPaint(settings.fill) ? settings.fill : null}
          onChange={(fill) => onChange({ fill })}
          onClear={() => onChange({ fill: "transparent" })}
        />
      )}
      <span className="w-px h-5 bg-[var(--s-border)] mx-0.5" />
      <div className="w-[76px]">
        <ScrubField label="W" value={settings.strokeWidth} min={MIN_STROKE} max={MAX_STROKE} onChange={(strokeWidth) => onChange({ strokeWidth })} />
      </div>
      <div className="w-[104px]">
        <BtnGroup
          options={DASH_STYLES.map(({ value, title }) => ({ value, title, icon: <DashStyleIcon style={value} /> }))}
          value={settings.dashStyle}
          onChange={(value) => onChange({ dashStyle: value as DashStyle })}
        />
      </div>
      <span className="w-px h-5 bg-[var(--s-border)] mx-0.5" />
      <button
        type="button"
        title={penMode ? "Finish path (Enter)" : "Done drawing"}
        onClick={onDone}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border-none cursor-pointer bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[11.5px] font-medium"
      >
        <Check size={13} strokeWidth={2.5} />
        Done
      </button>
    </div>
  </div>
);
