import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useAreaEditor, type AreaTool, type AreaValue } from "./use-area-editor";
import { AreaToolBar } from "./area-tool-bar";
import { trackEvent } from "../../../../lib/tracker";

interface MaskAreaModalProps {
  source: string;
  area: AreaValue;
  onApply: (area: AreaValue) => void;
  onClose: () => void;
}

const DEFAULT_BRUSH_SIZE = 80;

const TOOL_HINT: Record<AreaTool, string> = {
  brush: "paint over the part you want to adjust",
  erase: "paint to take parts out of the brush area",
  linear: "drag from where the adjustment is full to where it fades out",
  radial: "drag from the center outward to set the size",
};

export const MaskAreaModal: React.FC<MaskAreaModalProps> = ({ source, area, onApply, onClose }) => {
  const [tool, setTool] = useState<AreaTool>(area.shape ? area.shape.kind : "brush");
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const editor = useAreaEditor({ source, initial: area, tool, brushSize });

  const apply = (): void => {
    onApply(editor.result());
    trackEvent("grading", "mask_area_applied");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(10,12,18,0.6)] backdrop-blur-[3px] font-editorial"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="flex flex-col w-full max-w-[900px] max-h-[92vh] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--s-border)] shrink-0">
          <span className="text-[13px] font-semibold text-[var(--s-text)]">mask area</span>
          <button type="button" onClick={onClose} aria-label="close" className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] cursor-pointer">
            <X size={15} />
          </button>
        </div>

        <div className="relative flex items-center justify-center min-h-[220px] bg-[var(--s-bg-canvas)] overflow-hidden">
          <canvas
            ref={editor.displayRef}
            className={`block max-w-full max-h-[calc(92vh-200px)] object-contain touch-none cursor-crosshair ${editor.ready ? "" : "invisible"}`}
            onPointerDown={editor.onPointerDown}
            onPointerMove={editor.onPointerMove}
            onPointerUp={editor.onPointerUp}
          />
          {!editor.ready && <span className="absolute text-[12px] text-[var(--s-text-subtle)]">loading image…</span>}
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 border-t border-[var(--s-border)] shrink-0">
          <AreaToolBar
            tool={tool}
            brushSize={brushSize}
            onToolChange={setTool}
            onBrushSizeChange={setBrushSize}
            onClearBrush={editor.clearBrush}
            onClearShape={editor.clearShape}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-[var(--s-text-subtle)]">{TOOL_HINT[tool]}. red shows the area.</span>
            <button
              type="button"
              onClick={apply}
              disabled={!editor.ready}
              className="flex items-center gap-1.5 px-4 h-8 rounded-lg text-[12px] font-semibold bg-[var(--s-accent)] text-[var(--s-accent-text)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={12} /> apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
