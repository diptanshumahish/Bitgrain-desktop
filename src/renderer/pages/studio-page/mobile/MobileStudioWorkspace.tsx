import React, { useRef, useState } from "react";
import {
  ChevronLeft, Undo2, Redo2, Download, Type, Square, Image as ImageIcon,
  Copy, ArrowUp, ArrowDown, SlidersHorizontal, Plus, Minus, Maximize2, Palette, Layers, Scaling, Frame,
} from "lucide-react";
import { emitModal } from "../../../lib/event-bus";
import { SaveStatus } from "../../../components/studio/topbar/SaveStatus";
import { MobileStudioCanvas } from "./MobileStudioCanvas";
import { MobileLayerSheet } from "./MobileLayerSheet";
import { MobileLayersSheet } from "./MobileLayersSheet";
import { PopoverPortal } from "../../../components/portal/PopoverPortal";
import { ExportPopupPortal } from "../../../components/portal/ExportPopupPortal";
import { exportPopupSignal } from "../../../components/studio/panels/export-state";
import type { Layer } from "../../../data/studioTypes";
import type { HandleDir } from "../../../components/studio/layers/SelectionHandles";
import type { StudioWorkspaceProps } from "../StudioWorkspace";
import { applyResize } from "../../../utils/studio-layers";
import { isAspectLocked } from "../../../store/aspect-lock-store";
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

interface PrimaryActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

const Action: React.FC<PrimaryActionProps> = ({ icon, label, onClick, disabled, active }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[54px] rounded-xl transition-colors disabled:opacity-40 ${
      active ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]" : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium leading-none">{label}</span>
  </button>
);

const TopButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }> = ({ icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] transition-colors disabled:opacity-30"
  >
    {icon}
  </button>
);

export const MobileStudioWorkspace: React.FC<StudioWorkspaceProps> = (props) => {
  const {
    effectiveTemplate, background, layers, selectedIds, selectedLayer, image,
    canvasW, canvasH, editingId, past, future, pages, activePageId,
    setSelectedIds, setLayers, setEditingId, pushHistory, undo, redo,
    updateLayer, commitUpdate, handleExit, setBackground,
    handleAddText, handleAddShape, handleAddImageFromUrl, handleResizeToFormats, handleAddMockupPage,
    handleDuplicate, handleMoveLayerUp, handleMoveLayerDown, handleDeleteLayer,
  } = props;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [userZoom, setUserZoom] = useState(1);
  const exportRef = useRef<HTMLButtonElement>(null);

  const selectedId = selectedLayer?.id ?? null;

  const handleImageFile = (file: File | undefined): void => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const probe = new Image();
      probe.onload = () => handleAddImageFromUrl(src, { name: file.name, width: probe.naturalWidth, height: probe.naturalHeight });
      probe.onerror = () => handleAddImageFromUrl(src, { name: file.name });
      probe.src = src;
    };
    reader.readAsDataURL(file);
  };

  const zoomBy = (delta: number): void => {
    setUserZoom((value) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((value + delta) * 100) / 100)));
  };

  const handleMoveDelta = (id: string, dx: number, dy: number): void => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, x: l.x + dx, y: l.y + dy } : l)));
  };

  const handleResizeDelta = (id: string, dir: HandleDir, dx: number, dy: number): void => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? ({ ...l, ...applyResize(l, dir, dx, dy, isAspectLocked()) } as Layer)
          : l,
      ),
    );
  };

  const openExport = (): void => {
    const rect = exportRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0);
    exportPopupSignal.value = {
      template: effectiveTemplate,
      background,
      layers,
      image,
      anchorRect: rect,
      pages,
      activePageId,
    };
  };

  return (
    <main className="flex flex-col h-dvh overflow-hidden font-editorial bg-[var(--s-bg-canvas)]">
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--s-border)] shrink-0">
        <div className="flex items-center gap-1">
          <TopButton icon={<ChevronLeft size={18} strokeWidth={2} />} label="back" onClick={handleExit} />
          <TopButton icon={<Layers size={17} strokeWidth={2} />} label="layers" onClick={() => { setSheetOpen(false); setAddOpen(false); setLayersOpen((v) => !v); }} />
          <TopButton icon={<Scaling size={17} strokeWidth={2} />} label="resize" onClick={() => emitModal({ type: "resize", sourceWidth: canvasW, sourceHeight: canvasH, onApply: handleResizeToFormats })} />
          <TopButton icon={<Frame size={17} strokeWidth={2} />} label="mockups" onClick={() => emitModal({ type: "mockup", template: effectiveTemplate, background, layers, image, width: canvasW, height: canvasH, selectedLayer, onAddPage: handleAddMockupPage })} />
        </div>
        <div className="flex-1 flex justify-center min-w-0 px-1">
          <SaveStatus />
        </div>
        <div className="flex items-center gap-1">
          <TopButton icon={<Undo2 size={17} strokeWidth={2} />} label="undo" onClick={undo} disabled={past.length === 0} />
          <TopButton icon={<Redo2 size={17} strokeWidth={2} />} label="redo" onClick={redo} disabled={future.length === 0} />
          <button
            ref={exportRef}
            onClick={openExport}
            className="ml-1 flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-[var(--s-accent)] text-white text-[12px] font-medium"
          >
            <Download size={14} strokeWidth={2.5} />
            export
          </button>
        </div>
      </header>

      <MobileStudioCanvas
        layers={layers}
        canvasW={canvasW}
        canvasH={canvasH}
        background={background}
        image={image}
        selectedIds={selectedIds}
        editingId={editingId}
        userZoom={userZoom}
        onSelectLayer={(id) => { setSheetOpen(false); setSelectedIds(id ? [id] : []); }}
        onStartEdit={(id) => { setSelectedIds([id]); setEditingId(id); }}
        onEndEdit={(id, content, richContent) => { setEditingId(null); updateLayer(id, { content, richContent } as Partial<Layer>); pushHistory(); }}
        onCommitText={(id, content, richContent) => updateLayer(id, { content, richContent } as Partial<Layer>)}
        onMoveDelta={handleMoveDelta}
        onMoveEnd={() => pushHistory()}
        onResizeDelta={handleResizeDelta}
        onResizeEnd={() => pushHistory()}
        onUpdateLayer={updateLayer}
      />

      <div className="relative flex items-center justify-end gap-1 px-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 mb-1 rounded-full border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 backdrop-blur-xl px-1 py-1">
          <button onClick={() => zoomBy(-ZOOM_STEP)} aria-label="zoom out" className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]">
            <Minus size={15} strokeWidth={2} />
          </button>
          <button onClick={() => setUserZoom(1)} aria-label="fit" className="px-1.5 h-8 flex items-center justify-center text-[11px] tabular-nums text-[var(--s-text-muted)] min-w-[40px]">
            {Math.round(userZoom * 100)}%
          </button>
          <button onClick={() => zoomBy(ZOOM_STEP)} aria-label="zoom in" className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]">
            <Plus size={15} strokeWidth={2} />
          </button>
          <button onClick={() => setUserZoom(1)} aria-label="reset fit" className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--s-text-muted)] active:bg-[var(--s-bg-input-hover)]">
            <Maximize2 size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="shrink-0 bg-[var(--s-bg-panel)]/95 backdrop-blur-xl border-t border-[var(--s-border)] rounded-t-2xl pb-safe">
        <div className="flex items-center gap-1 px-2 py-2">
          <Action icon={<Plus size={18} strokeWidth={2.5} />} label="add" active={addOpen} onClick={() => { setSheetOpen(false); setAddOpen((v) => !v); }} />
          {selectedLayer && (
            <>
              <Action icon={<SlidersHorizontal size={18} strokeWidth={2} />} label="edit" active={sheetOpen} onClick={() => { setAddOpen(false); setSheetOpen((v) => !v); }} />
              <Action icon={<Copy size={18} strokeWidth={2} />} label="duplicate" onClick={() => selectedId && handleDuplicate([selectedId])} />
              <Action icon={<ArrowUp size={18} strokeWidth={2} />} label="forward" onClick={() => selectedId && handleMoveLayerUp(selectedId)} />
              <Action icon={<ArrowDown size={18} strokeWidth={2} />} label="back" onClick={() => selectedId && handleMoveLayerDown(selectedId)} />
            </>
          )}
        </div>
      </div>

      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setAddOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--s-bg-panel)] rounded-t-2xl border-t border-[var(--s-border)] pb-safe animate-popover">
            <div className="px-5 pt-3 pb-2 border-b border-[var(--s-border)] text-sm font-medium text-[var(--s-text)]">add to design</div>
            <div className="grid grid-cols-4 gap-1 p-3">
              <button onClick={() => { handleAddText(); setAddOpen(false); }} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]">
                <Type size={20} strokeWidth={2} /><span className="text-[11px]">text</span>
              </button>
              <button onClick={() => { handleAddShape("rect"); setAddOpen(false); }} className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]">
                <Square size={20} strokeWidth={2} /><span className="text-[11px]">shape</span>
              </button>
              <label className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] cursor-pointer">
                <ImageIcon size={20} strokeWidth={2} /><span className="text-[11px]">image</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleImageFile(e.target.files?.[0]); e.target.value = ""; setAddOpen(false); }} />
              </label>
              <label className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] cursor-pointer">
                <Palette size={20} strokeWidth={2} /><span className="text-[11px]">background</span>
                <input type="color" value={background} className="sr-only" onChange={(e) => setBackground(e.target.value)} />
              </label>
            </div>
          </div>
        </>
      )}

      {layersOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setLayersOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--s-bg-panel)] rounded-t-2xl border-t border-[var(--s-border)] max-h-[60vh] overflow-y-auto no-scrollbar pb-safe animate-popover">
            <MobileLayersSheet
              layers={layers}
              selectedId={selectedId}
              onSelect={(id) => setSelectedIds([id])}
              onMoveUp={handleMoveLayerUp}
              onMoveDown={handleMoveLayerDown}
              onToggleVisible={(layer) => commitUpdate(layer.id, { visible: !layer.visible })}
              onDelete={(id) => handleDeleteLayer(id)}
              onClose={() => setLayersOpen(false)}
            />
          </div>
        </>
      )}

      {selectedLayer && sheetOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSheetOpen(false)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--s-bg-panel)] rounded-t-2xl border-t border-[var(--s-border)] max-h-[60vh] overflow-y-auto no-scrollbar pb-safe animate-popover">
            <MobileLayerSheet
              layer={selectedLayer}
              onUpdate={(updates) => selectedId && commitUpdate(selectedId, updates)}
              onDelete={() => { if (selectedId) handleDeleteLayer(selectedId); setSheetOpen(false); }}
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </>
      )}

      <PopoverPortal />
      <ExportPopupPortal />
    </main>
  );
};
