import React, { useState } from "react";
import { Lock, Unlock, Scaling } from "lucide-react";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField } from "../ui/panelPrimitives";
import { PanelGroup } from "../ui/panel-group";

interface BackgroundPropertiesProps {
  color: string;
  colorVar?: string;
  onChange: (color: string) => void;
  onBindVariable?: (varId: string, value: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasResize: (w: number, h: number) => void;
  scaleContents: boolean;
  onToggleScaleContents: () => void;
}

const PRESETS = [
  { label: "Square", w: 1080, h: 1080 },
  { label: "Portrait", w: 1080, h: 1350 },
  { label: "Story", w: 1080, h: 1920 },
  { label: "Landscape", w: 1920, h: 1080 },
  { label: "A4", w: 794, h: 1123 },
  { label: "Album", w: 3000, h: 3000 },
  { label: "Banner", w: 1584, h: 396 },
  { label: "Card", w: 1050, h: 600 },
];

export const BackgroundProperties: React.FC<BackgroundPropertiesProps> = ({
  color,
  colorVar,
  onChange,
  onBindVariable,
  canvasWidth,
  canvasHeight,
  onCanvasResize,
  scaleContents,
  onToggleScaleContents,
}) => {
  const [lockAspect, setLockAspect] = useState(false);
  const ratio = canvasWidth / canvasHeight;

  const handleW = (w: number) => {
    const clamped = Math.max(100, Math.round(w));
    onCanvasResize(
      clamped,
      lockAspect ? Math.round(clamped / ratio) : canvasHeight,
    );
  };

  const handleH = (h: number) => {
    const clamped = Math.max(100, Math.round(h));
    onCanvasResize(
      lockAspect ? Math.round(clamped * ratio) : canvasWidth,
      clamped,
    );
  };

  return (
    <div className="flex flex-col font-editorial">
      <PanelGroup title="Background">
        <ColorPicker
          color={color}
          varId={colorVar}
          onChange={onChange}
          onBindVariable={onBindVariable}
        />
      </PanelGroup>

      <PanelGroup title="Canvas size">
        <div className="flex items-center gap-1.5">
          <small className="text-[10px] text-[var(--s-text-subtle)] mr-auto">
            Proportions
          </small>
          <button
            onClick={onToggleScaleContents}
            title={scaleContents ? "Scale contents: on" : "Scale contents: off"}
            className={`w-6 h-6 rounded-md border-none cursor-pointer flex items-center justify-center shrink-0 transition-all duration-100 ${
              scaleContents
                ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)]"
            }`}
          >
            <Scaling size={11} />
          </button>
          <button
            onClick={() => setLockAspect((v) => !v)}
            title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
            className={`w-6 h-6 rounded-md border-none cursor-pointer flex items-center justify-center shrink-0 transition-all duration-100 ${
              lockAspect
                ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)]"
            }`}
          >
            {lockAspect ? <Lock size={11} /> : <Unlock size={11} />}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <ScrubField
            label="W"
            value={canvasWidth}
            min={100}
            onChange={handleW}
          />
          <span className="text-[var(--s-text-subtle)] text-[11px] px-0.5">
            ×
          </span>
          <ScrubField
            label="H"
            value={canvasHeight}
            min={100}
            onChange={handleH}
          />
        </div>
      </PanelGroup>

      <PanelGroup title="Presets">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const active = canvasWidth === p.w && canvasHeight === p.h;
            return (
              <button
                key={p.label}
                onClick={() => onCanvasResize(p.w, p.h)}
                className={`px-2.5 py-1 rounded-full border-none cursor-pointer text-[10px] font-editorial font-medium transition-all duration-100 ${
                  active
                    ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                    : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)] hover:bg-[var(--s-selection)]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </PanelGroup>
    </div>
  );
};
