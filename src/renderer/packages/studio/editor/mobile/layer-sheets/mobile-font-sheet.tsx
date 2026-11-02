import React from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { FONT_FAMILIES } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { adminFontOptionsSignal, availableWeightsForFamily, availableStylesForFamily } from "@bitgrain/studio-core/fonts/admin-fonts";
import { SliderTrack } from "@bitgrain/ui/controls/panel/slider-track/slider-track";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { SheetRow } from "../sheet-chrome/sheet-row";
import { TextAlignButtons } from "./text-align-buttons";

interface MobileFontSheetProps {
  layer: TextLayer;
  onUpdate: (updates: Partial<TextLayer>) => void;
  onClose: () => void;
}

const FONT_SIZE_MIN = 8;
const FONT_SIZE_MAX = 400;

const DEFAULT_WEIGHTS = [
  { label: "Light", value: "300" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extrabold", value: "800" },
  { label: "Black", value: "900" },
];

const SELECT_CLASS =
  "max-w-[200px] h-11 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-input)] px-3 text-[14px] text-[var(--s-text)] outline-none";

export const MobileFontSheet: React.FC<MobileFontSheetProps> = ({ layer, onUpdate, onClose }) => {
  const adminFonts = useSignalValue(adminFontOptionsSignal);
  const fontOptions = [...adminFonts, ...FONT_FAMILIES];
  const weightOptions = availableWeightsForFamily(layer.fontFamily) ?? DEFAULT_WEIGHTS;
  const styles = availableStylesForFamily(layer.fontFamily);
  const isItalic = layer.fontStyle === "italic";
  const canItalic = !styles || styles.italic;

  return (
    <MobileSheet title="Font" onClose={onClose} dimmed={false}>
      <div className="flex flex-col pb-3">
        <SheetRow label="Typeface">
          <select value={layer.fontFamily} onChange={(event) => onUpdate({ fontFamily: event.target.value })} className={SELECT_CLASS}>
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </SheetRow>
        <SheetRow label="Weight">
          <select
            value={layer.fontWeight}
            onChange={(event) => onUpdate({ fontWeight: event.target.value as TextLayer["fontWeight"] })}
            className={SELECT_CLASS}
          >
            {weightOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </SheetRow>
        <SheetRow label={`Size ${Math.round(layer.fontSize)}`}>
          <div className="w-48">
            <SliderTrack
              ariaLabel="Font size"
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
              step={1}
              value={layer.fontSize}
              onChange={(fontSize) => onUpdate({ fontSize })}
            />
          </div>
        </SheetRow>
        <SheetRow label="Align">
          <TextAlignButtons value={layer.align} onChange={(align) => onUpdate({ align })} />
          {canItalic && (
            <button
              type="button"
              aria-pressed={isItalic}
              aria-label="Italic"
              onClick={() => onUpdate({ fontStyle: isItalic ? "regular" : "italic" })}
              className={`w-11 h-11 flex items-center justify-center rounded-xl transition-colors ${
                isItalic ? "bg-[var(--s-accent-soft)] text-[var(--s-text)]" : "text-[var(--s-text-muted)]"
              }`}
            >
              <span className="text-[15px] italic font-semibold">I</span>
            </button>
          )}
        </SheetRow>
      </div>
    </MobileSheet>
  );
};
