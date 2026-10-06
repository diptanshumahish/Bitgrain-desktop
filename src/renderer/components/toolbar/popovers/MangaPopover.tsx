import React from "react";
import { Popover, PopoverSection } from "../Popover";
import { Slider } from "../slider";
import { EditableValue } from "../editable-value";
import type { TransformMode } from "../../../engine/types";
import { trackEvent } from "../../../lib/tracker";

interface MangaPopoverProps {
  mode: TransformMode[];
  onToggle: () => void;
  mangaCell: number;
  setMangaCell: (v: number) => void;
  mangaAngle: number;
  setMangaAngle: (v: number) => void;
  mangaLineWeight: number;
  setMangaLineWeight: (v: number) => void;
  mangaContrast: number;
  setMangaContrast: (v: number) => void;
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({
  checked,
  onChange,
}) => (
  <button
    onClick={onChange}
    role="switch"
    aria-checked={checked}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
      checked ? "bg-[var(--s-accent)]" : "bg-[var(--s-bg-input)]"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white transform transition-transform duration-200 ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

interface RowConfig {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  scale?: number;
  decimals?: number;
  onChange: (v: number) => void;
  event: string;
}

export const MangaPopover: React.FC<MangaPopoverProps> = ({
  mode,
  onToggle,
  mangaCell,
  setMangaCell,
  mangaAngle,
  setMangaAngle,
  mangaLineWeight,
  setMangaLineWeight,
  mangaContrast,
  setMangaContrast,
  onStateChangeFinished,
  onClose,
  static: isStatic,
}) => {
  const isActive = mode.includes("manga");

  const rows: RowConfig[] = [
    { label: "Hatch gap", value: mangaCell, min: 2, max: 14, step: 1, suffix: "px", onChange: setMangaCell, event: "cell_changed" },
    { label: "Angle", value: mangaAngle, min: 0, max: 90, step: 5, suffix: "°", onChange: setMangaAngle, event: "angle_changed" },
    { label: "Line weight", value: mangaLineWeight, min: 0, max: 1, step: 0.05, scale: 100, suffix: "%", onChange: setMangaLineWeight, event: "line_weight_changed" },
    { label: "Contrast", value: mangaContrast, min: 0, max: 1, step: 0.05, scale: 100, suffix: "%", onChange: setMangaContrast, event: "contrast_changed" },
  ];

  return (
    <Popover onClose={onClose} className="w-60" static={isStatic}>
      <PopoverSection>
        <div className="flex items-center justify-between px-1 pb-1">
          <div>
            <p className="text-[11px] font-semibold text-[var(--s-text)]">Manga</p>
            <p className="text-[9px] text-[var(--s-text-subtle)] mt-0.5">
              Crosshatch with inked lines
            </p>
          </div>
          <ToggleSwitch checked={isActive} onChange={onToggle} />
        </div>
      </PopoverSection>

      <div className="h-px bg-[var(--s-border)] opacity-50 mx-2" />

      <PopoverSection title="Controls">
        <div
          className={`flex flex-col gap-2.5 px-0.5 pb-0.5 transition-opacity ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
        >
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[62px_1fr_40px] items-center gap-2">
              <span className="text-[9px] text-[var(--s-text-subtle)] select-none">{row.label}</span>
              <Slider
                min={row.min}
                max={row.max}
                step={row.step}
                value={row.value}
                onChange={row.onChange}
                onDone={() => {
                  onStateChangeFinished();
                  trackEvent("manga", row.event, { details: { value: row.value } });
                }}
              />
              <EditableValue
                value={row.value}
                min={row.min}
                max={row.max}
                step={row.step}
                suffix={row.suffix}
                scale={row.scale}
                decimals={row.decimals}
                onChange={row.onChange}
                onCommit={() => {
                  onStateChangeFinished();
                  trackEvent("manga", row.event, { details: { value: row.value } });
                }}
              />
            </div>
          ))}
        </div>
      </PopoverSection>
    </Popover>
  );
};
