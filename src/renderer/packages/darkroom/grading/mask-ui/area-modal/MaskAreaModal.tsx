import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useAreaEditor, type AreaTool, type AreaValue } from "./use-area-editor";
import { AreaToolBar } from "./area-tool-bar";
import { trackEvent } from "@bitgrain/platform/tracker";
import { Button } from "@bitgrain/ui/components/Button";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

interface MaskAreaModalProps {
  source: string;
  area: AreaValue;
  onApply: (area: AreaValue) => void;
  onClose: () => void;
}

const DEFAULT_BRUSH_SIZE = 80;

const TOOL_HINT: Record<AreaTool, string> = {
  brush: "Paint over the part you want to adjust",
  erase: "Paint to take parts out of the brush area",
  linear: "Drag from where the adjustment is full to where it fades out",
  radial: "Drag from the center outward to set the size",
};

export const MaskAreaModal: React.FC<MaskAreaModalProps> = ({ source, area, onApply, onClose }) => {
  const [tool, setTool] = useState<AreaTool>(area.shape ? area.shape.kind : "brush");
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const { displayRef, ready, onPointerDown, onPointerMove, onPointerUp, clearBrush, clearShape, result } = useAreaEditor({
    source,
    initial: area,
    tool,
    brushSize,
  });

  const apply = (): void => {
    onApply(result());
    trackEvent("grading", "mask_area_applied");
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.6)] backdrop-blur-[3px] font-editorial`}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="flex flex-col w-full max-w-[900px] max-h-[92vh] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--s-border)] shrink-0">
          <span className="text-[13px] font-semibold text-[var(--s-text)]">Mask area</span>
          <Button variant="ghost" size="sm" iconOnly onClick={onClose} aria-label="Close">
            <X size={15} />
          </Button>
        </div>

        <div className="relative flex items-center justify-center min-h-[220px] bg-[var(--s-bg-canvas)] overflow-hidden">
          <canvas
            ref={displayRef}
            className={`block max-w-full max-h-[calc(92vh-200px)] object-contain touch-none cursor-crosshair ${ready ? "" : "invisible"}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
          {!ready && <span className="absolute text-[12px] text-[var(--s-text-subtle)]">Loading image…</span>}
        </div>

        <div className="flex flex-col gap-3 px-4 py-3 border-t border-[var(--s-border)] shrink-0">
          <AreaToolBar
            tool={tool}
            brushSize={brushSize}
            onToolChange={setTool}
            onBrushSizeChange={setBrushSize}
            onClearBrush={clearBrush}
            onClearShape={clearShape}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-[var(--s-text-subtle)]">{TOOL_HINT[tool]}. Red shows the area.</span>
            <Button variant="primary" size="sm" onClick={apply} disabled={!ready}>
              <Check size={12} /> Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
