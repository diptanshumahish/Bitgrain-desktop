import React from "react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { PopoverPortal } from "@bitgrain/ui/overlays/PopoverPortal";
import { exportPopupSignal } from "../../panels/export-state";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import type { StudioWorkspaceProps } from "../StudioWorkspace";
import { applyResize } from "@bitgrain/studio-core/layers/studio-layers";
import { useGestureHistory } from "../use-gesture-history";
import { isAspectLocked } from "../../state/aspect-lock-store";
import { MobileStudioCanvas } from "./MobileStudioCanvas";
import { MobileTopBar } from "./top-bar/mobile-top-bar";
import { MobileBottomBar } from "./bottom-bar/mobile-bottom-bar";
import { MobileSheetHost } from "./mobile-sheet-host";
import { MobileExportSheet } from "./export/mobile-export-sheet";
import { closeMobileSheet, openMobileSheet } from "./mobile-sheet-state";
import { useMobileLayerUpdate } from "./use-mobile-layer-update";
import type { PickedImage } from "./bottom-bar/read-picked-image";

const FALLBACK_TITLE = "Untitled design";

export const MobileStudioWorkspace: React.FC<StudioWorkspaceProps> = (props) => {
  const {
    effectiveTemplate, background, layers, selectedIds, selectedLayer, image,
    canvasW, canvasH, past, future, pages, activePageId, dark, workName,
    setSelectedIds, setLayers, pushHistory, undo, redo, updateLayer, commitUpdate, handleExit,
    handleDuplicate, handleDeleteLayer,
  } = props;
  const gestureHistory = useGestureHistory(pushHistory);
  const { updateLayerFromSheet, setBackgroundFromSheet } = useMobileLayerUpdate(props, gestureHistory);

  const selectLayer = (id: string | null): void => {
    if (id !== selectedIds[0]) closeMobileSheet();
    setSelectedIds(id ? [id] : []);
  };

  const selectFromList = (id: string): void => {
    closeMobileSheet();
    setSelectedIds([id]);
  };

  const startTextEdit = (id: string): void => {
    setSelectedIds([id]);
    openMobileSheet("text");
  };

  const moveLayer = (id: string, dx: number, dy: number): void => {
    gestureHistory.beginGesture();
    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, x: layer.x + dx, y: layer.y + dy } : layer)));
  };

  const resizeLayer = (id: string, dir: HandleDir, dx: number, dy: number): void => {
    gestureHistory.beginGesture();
    setLayers((prev) =>
      prev.map((layer) => (layer.id === id ? ({ ...layer, ...applyResize(layer, dir, dx, dy, isAspectLocked()) } as Layer) : layer)),
    );
  };

  const replacePhoto = (id: string, picked: PickedImage): void => {
    commitUpdate(id, { src: picked.src } as Partial<Layer>);
    trackEvent("studio", "image_replaced", { details: { source: "mobile" } });
  };

  const deleteLayer = (id: string): void => {
    closeMobileSheet();
    handleDeleteLayer(id);
  };

  const runUndo = (): void => {
    undo();
    trackEvent("studio", "undo_used", { details: { source: "mobile" } });
  };

  const runRedo = (): void => {
    redo();
    trackEvent("studio", "redo_used", { details: { source: "mobile" } });
  };

  const openExport = (): void => {
    closeMobileSheet();
    exportPopupSignal.value = { template: effectiveTemplate, background, layers, image, pages, activePageId };
  };

  return (
    <main
      data-theme={dark ? "dark" : "light"}
      className="flex flex-col h-dvh overflow-hidden font-editorial bg-[var(--s-bg-canvas)]"
    >
      <MobileTopBar
        title={workName || effectiveTemplate.name || FALLBACK_TITLE}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onBack={handleExit}
        onUndo={runUndo}
        onRedo={runRedo}
        onExport={openExport}
      />

      <MobileStudioCanvas
        layers={layers}
        canvasW={canvasW}
        canvasH={canvasH}
        background={background}
        image={image}
        selectedIds={selectedIds}
        selectedLayer={selectedLayer}
        onSelectLayer={selectLayer}
        onStartEdit={startTextEdit}
        onMoveDelta={moveLayer}
        onMoveEnd={gestureHistory.endGesture}
        onResizeDelta={resizeLayer}
        onResizeEnd={gestureHistory.endGesture}
        onUpdateLayer={updateLayer}
      />

      <MobileBottomBar
        selectedLayer={selectedLayer}
        pageCount={pages.length}
        onDone={() => selectLayer(null)}
        onDuplicate={(id) => handleDuplicate([id])}
        onDelete={deleteLayer}
        onReplacePhoto={replacePhoto}
      />

      <MobileSheetHost
        workspace={props}
        onUpdateLayer={updateLayerFromSheet}
        onSetBackground={setBackgroundFromSheet}
        onSelectLayer={selectFromList}
      />
      <MobileExportSheet />
      <PopoverPortal />
    </main>
  );
};
