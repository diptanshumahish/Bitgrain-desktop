import React from "react";
import { Brush, Eraser, Circle, MoveDiagonal } from "lucide-react";
import type { AreaTool } from "./use-area-editor";
import { Slider } from "../../../../components/studio/ui/slider";

interface AreaToolBarProps {
  tool: AreaTool;
  brushSize: number;
  onToolChange: (tool: AreaTool) => void;
  onBrushSizeChange: (size: number) => void;
  onClearBrush: () => void;
  onClearShape: () => void;
}

const BRUSH_MIN = 10;
const BRUSH_MAX = 240;

const TOOLS: Array<{ value: AreaTool; label: string; icon: React.ReactNode }> = [
  { value: "brush", label: "brush", icon: <Brush size={12} /> },
  { value: "erase", label: "erase", icon: <Eraser size={12} /> },
  { value: "linear", label: "linear", icon: <MoveDiagonal size={12} /> },
  { value: "radial", label: "radial", icon: <Circle size={12} /> },
];

const toolClass = (active: boolean): string =>
  `flex items-center gap-1.5 px-2.5 h-7 rounded-md border text-[11px] cursor-pointer transition-colors ${
    active
      ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
      : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
  }`;

export const AreaToolBar: React.FC<AreaToolBarProps> = ({ tool, brushSize, onToolChange, onBrushSizeChange, onClearBrush, onClearShape }) => (
  <div className="flex flex-wrap items-center gap-2">
    {TOOLS.map((option) => (
      <button key={option.value} type="button" onClick={() => onToolChange(option.value)} className={toolClass(tool === option.value)}>
        {option.icon} {option.label}
      </button>
    ))}
    {(tool === "brush" || tool === "erase") && (
      <div className="w-40">
        <Slider label="Size" min={BRUSH_MIN} max={BRUSH_MAX} value={brushSize} suffix="px" onChange={onBrushSizeChange} />
      </div>
    )}
    <div className="ml-auto flex items-center gap-2">
      <button type="button" onClick={onClearBrush} className={toolClass(false)}>clear brush</button>
      <button type="button" onClick={onClearShape} className={toolClass(false)}>clear gradient</button>
    </div>
  </div>
);
