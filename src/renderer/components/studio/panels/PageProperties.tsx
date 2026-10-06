import React from "react";
import { Lock, Unlock } from "lucide-react";
import type { TemplatePage } from "../../../data/studioTypes";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField } from "../ui/panelPrimitives";
import { PanelGroup } from "../ui/panel-group";
import { useAspectLocked, toggleAspectLock } from "../../../store/aspect-lock-store";

interface PagePropertiesProps {
  page: TemplatePage;
  pageIndex: number;
  totalPages: number;
  onRename: (id: string, name: string) => void;
  onBackgroundChange: (id: string, color: string) => void;
  onBackgroundBind?: (id: string, varId: string, value: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const MIN_DIMENSION = 50;

export const PageProperties: React.FC<PagePropertiesProps> = ({
  page, pageIndex, totalPages, onRename, onBackgroundChange, onBackgroundBind, onResize, onMove,
}) => {
  const lockAspect = useAspectLocked();
  const ratio = page.width / page.height;

  const handleW = (value: number) => {
    const clamped = Math.max(MIN_DIMENSION, Math.round(value));
    onResize(page.id, clamped, lockAspect ? Math.round(clamped / ratio) : page.height);
  };

  const handleH = (value: number) => {
    const clamped = Math.max(MIN_DIMENSION, Math.round(value));
    onResize(page.id, lockAspect ? Math.round(clamped * ratio) : page.width, clamped);
  };

  return (
    <div className="flex flex-col font-editorial">
      <PanelGroup title="Name">
        <input
          type="text"
          value={page.name}
          onChange={(event) => onRename(page.id, event.target.value)}
          placeholder={`Page ${pageIndex + 1}`}
          className="w-full px-2.5 h-8 rounded-md bg-[var(--s-bg-input)] text-[11.5px] text-[var(--s-text)] border border-[var(--s-border)] outline-none focus:border-[var(--s-accent)] transition-colors"
        />
        <span className="text-[10px] text-[var(--s-text-subtle)] [font-variant-numeric:tabular-nums]">
          Page {pageIndex + 1} of {totalPages}
        </span>
      </PanelGroup>

      <PanelGroup title="Background">
        <ColorPicker
          color={page.background}
          varId={page.backgroundVar}
          onChange={(color) => onBackgroundChange(page.id, color)}
          onBindVariable={(varId, value) => onBackgroundBind?.(page.id, varId, value)}
        />
      </PanelGroup>

      <PanelGroup title="Size">
        <div className="flex items-center gap-1.5">
          <small className="text-[10px] text-[var(--s-text-subtle)] mr-auto">
            Proportions
          </small>
          <button
            type="button"
            onClick={toggleAspectLock}
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
          <ScrubField label="W" value={page.width} min={MIN_DIMENSION} onChange={handleW} />
          <span className="text-[var(--s-text-subtle)] text-[11px] px-0.5">×</span>
          <ScrubField label="H" value={page.height} min={MIN_DIMENSION} onChange={handleH} />
        </div>
      </PanelGroup>

      <PanelGroup title="Position">
        <div className="grid grid-cols-2 gap-2">
          <ScrubField label="X" value={page.x} onChange={(value) => onMove(page.id, Math.round(value), page.y)} />
          <ScrubField label="Y" value={page.y} onChange={(value) => onMove(page.id, page.x, Math.round(value))} />
        </div>
      </PanelGroup>
    </div>
  );
};
