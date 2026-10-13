import React from "react";
import { Palette } from "lucide-react";
import { Slider } from "../slider";
import { ToggleSwitch } from "./ToggleSwitch";
import { qualityToColorCount, type ExportFormat } from "../../../engine/export/export-types";

interface ExportQualityRowProps {
  format: ExportFormat;
  quality: number;
  onQualityChange: (value: number) => void;
  reducePalette: boolean;
  onToggleReducePalette: () => void;
}

const QUALITY_MIN = 1;
const QUALITY_MAX = 100;
const QUALITY_STEP = 1;
const PERCENT_DIVISOR = 100;
const ICON_SIZE = 11;
const ICON_STROKE = 1.6;
const HDR_HINT = "HDR PNG, for HDR displays";
const SLIDER_ROW_CLASS = "grid grid-cols-[auto_1fr_64px] items-center gap-2.5 px-2 h-8";
const LABEL_CLASS = "text-[12px] text-[var(--s-text-muted)]";
const VALUE_CLASS = "text-[12px] text-[var(--s-text-subtle)] tabular-nums text-right";

interface QualitySliderProps {
  label: string;
  hint: string;
  quality: number;
  onQualityChange: (value: number) => void;
}

const QualitySlider: React.FC<QualitySliderProps> = ({ label, hint, quality, onQualityChange }) => (
  <div className={SLIDER_ROW_CLASS}>
    <span className={LABEL_CLASS}>{label}</span>
    <Slider min={QUALITY_MIN} max={QUALITY_MAX} step={QUALITY_STEP} value={quality} onChange={onQualityChange} label={label} />
    <span className={VALUE_CLASS}>{hint}</span>
  </div>
);

const PngPaletteControls: React.FC<ExportQualityRowProps> = ({ quality, onQualityChange, reducePalette, onToggleReducePalette }) => (
  <>
    <button
      type="button"
      role="switch"
      aria-checked={reducePalette}
      onClick={onToggleReducePalette}
      className="flex items-center justify-between px-2 h-8 rounded-md text-[12px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors"
    >
      <span className="flex items-center gap-2">
        <Palette size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        Reduce colours for a smaller file
      </span>
      <ToggleSwitch on={reducePalette} />
    </button>
    {reducePalette && (
      <QualitySlider label="Colours" hint={`${qualityToColorCount(quality / PERCENT_DIVISOR)} colours`} quality={quality} onQualityChange={onQualityChange} />
    )}
  </>
);

export const ExportQualityRow: React.FC<ExportQualityRowProps> = (props) => {
  if (props.format === "png-hdr") {
    return <p className="px-2 h-8 flex items-center text-[12px] text-[var(--s-text-subtle)]">{HDR_HINT}</p>;
  }
  if (props.format === "png") return <PngPaletteControls {...props} />;
  return <QualitySlider label="Quality" hint={`${props.quality}%`} quality={props.quality} onQualityChange={props.onQualityChange} />;
};
