import React from "react";
import { AlignLeft, AlignCenter, AlignRight, Trash2, X, Minus, Plus } from "lucide-react";
import type { Layer, TextLayer, ShapeLayer } from "../../../data/studioTypes";
import { FONT_FAMILIES } from "../../../data/studioTypes";
import { useSignalValue } from "../../../lib/signal";
import { adminFontOptionsSignal, availableWeightsForFamily, availableStylesForFamily } from "../../../lib/admin-fonts";
import { SliderTrack } from "../../../components/studio/ui/slider-track/slider-track";

const SCALE_DOWN = 0.9;
const SCALE_UP = 1.1;
const MIN_SIZE = 8;

const DEFAULT_WEIGHTS = [
  { label: "300 Light", value: "300" },
  { label: "400 Regular", value: "400" },
  { label: "500 Medium", value: "500" },
  { label: "600 Semibold", value: "600" },
  { label: "700 Bold", value: "700" },
  { label: "800 Extrabold", value: "800" },
  { label: "900 Black", value: "900" },
];
const SELECT_CLASS = "max-w-[180px] rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] px-2 py-1.5 text-[13px] text-[var(--s-text)] outline-none";

interface MobileLayerSheetProps {
  layer: Layer;
  onUpdate: (updates: Partial<Layer>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const FONT_MIN = 8;
const FONT_MAX = 400;
const PERCENT = 100;
const ALIGNMENTS: { value: TextLayer["align"]; icon: React.ReactNode }[] = [
  { value: "left", icon: <AlignLeft size={16} strokeWidth={2} /> },
  { value: "center", icon: <AlignCenter size={16} strokeWidth={2} /> },
  { value: "right", icon: <AlignRight size={16} strokeWidth={2} /> },
];

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 px-5 py-2.5">
    <span className="text-[12px] text-[var(--s-text-muted)] shrink-0">{label}</span>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

export const MobileLayerSheet: React.FC<MobileLayerSheetProps> = ({ layer, onUpdate, onDelete, onClose }) => {
  const text = layer.type === "text" ? (layer as TextLayer) : null;
  const shape = layer.type === "shape" ? (layer as ShapeLayer) : null;

  const adminFonts = useSignalValue(adminFontOptionsSignal);
  const fontOptions = [...adminFonts, ...FONT_FAMILIES];
  const weightOptions = text ? availableWeightsForFamily(text.fontFamily) ?? DEFAULT_WEIGHTS : DEFAULT_WEIGHTS;
  const styles = text ? availableStylesForFamily(text.fontFamily) : null;
  const isItalic = text?.fontStyle === "italic";

  const scaleBy = (factor: number): void => {
    const width = Math.max(MIN_SIZE, layer.width * factor);
    const height = Math.max(MIN_SIZE, layer.height * factor);
    onUpdate({
      width,
      height,
      x: layer.x - (width - layer.width) / 2,
      y: layer.y - (height - layer.height) / 2,
    });
  };

  return (
    <div className="flex flex-col pb-2">
      <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-[var(--s-border)]">
        <span className="text-sm font-medium text-[var(--s-text)] capitalize">{layer.type}</span>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]">
          <X size={15} strokeWidth={2} />
        </button>
      </div>

      {text && (
        <div className="px-5 py-3">
          <textarea
            value={text.content}
            onChange={(event) => onUpdate({ content: event.target.value } as Partial<Layer>)}
            rows={2}
            className="w-full rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] px-3 py-2 text-[14px] text-[var(--s-text)] outline-none resize-none"
            placeholder="type your text"
          />
        </div>
      )}

      {text && (
        <Row label="font">
          <select
            value={text.fontFamily}
            onChange={(event) => onUpdate({ fontFamily: event.target.value } as Partial<Layer>)}
            className={SELECT_CLASS}
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </Row>
      )}

      {text && (
        <Row label="weight">
          <select
            value={text.fontWeight}
            onChange={(event) => onUpdate({ fontWeight: event.target.value } as Partial<Layer>)}
            className={SELECT_CLASS}
          >
            {weightOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Row>
      )}

      {text && (!styles || styles.italic) && (
        <Row label="italic">
          <button
            onClick={() => onUpdate({ fontStyle: isItalic ? "regular" : "italic" } as Partial<Layer>)}
            className={`w-12 h-9 flex items-center justify-center rounded-lg transition-colors ${
              isItalic ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]" : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"
            }`}
          >
            <span className="text-[13px] italic font-semibold">Aa</span>
          </button>
        </Row>
      )}

      {text && (
        <Row label="font size">
          <div className="w-44">
            <SliderTrack
              ariaLabel="Font size"
              min={FONT_MIN}
              max={FONT_MAX}
              step={1}
              value={text.fontSize}
              onChange={(fontSize) => onUpdate({ fontSize } as Partial<Layer>)}
            />
          </div>
        </Row>
      )}

      {text && (
        <Row label="align">
          <div className="flex items-center gap-1">
            {ALIGNMENTS.map((option) => (
              <button
                key={option.value}
                onClick={() => onUpdate({ align: option.value } as Partial<Layer>)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  text.align === option.value
                    ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
                    : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"
                }`}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </Row>
      )}

      {text && (
        <Row label="color">
          <input
            type="color"
            value={text.color}
            onChange={(event) => onUpdate({ color: event.target.value } as Partial<Layer>)}
            className="w-9 h-9 rounded-lg border border-[var(--s-border)] bg-transparent"
          />
        </Row>
      )}

      {shape && (
        <Row label="fill">
          <input
            type="color"
            value={shape.fill}
            onChange={(event) => onUpdate({ fill: event.target.value } as Partial<Layer>)}
            className="w-9 h-9 rounded-lg border border-[var(--s-border)] bg-transparent"
          />
        </Row>
      )}

      {!text && (
        <Row label="size">
          <button onClick={() => scaleBy(SCALE_DOWN)} aria-label="smaller" className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]">
            <Minus size={16} strokeWidth={2} />
          </button>
          <button onClick={() => scaleBy(SCALE_UP)} aria-label="bigger" className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]">
            <Plus size={16} strokeWidth={2} />
          </button>
        </Row>
      )}

      <Row label="opacity">
        <div className="w-44">
          <SliderTrack
            ariaLabel="Opacity"
            min={0}
            max={PERCENT}
            step={1}
            value={Math.round(layer.opacity * PERCENT)}
            onChange={(opacity) => onUpdate({ opacity: opacity / PERCENT })}
          />
        </div>
      </Row>

      <div className="px-5 pt-2">
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={14} strokeWidth={2} />
          delete layer
        </button>
      </div>
    </div>
  );
};
