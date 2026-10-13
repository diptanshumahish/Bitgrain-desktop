import React, { useEffect } from "react";
import { DarkroomPanel } from "./home-page/panel/DarkroomPanel";
import { DesktopExportButton, desktopExportOpenSignal } from "../components/toolbar/DesktopExportButton";
import { setTitlebarActions, clearTitlebarActions } from "../store/titlebar-actions-store";
import { registerSurfaceCommands, clearSurfaceCommands } from "../store/surface-commands-store";
import { saveActiveDarkroom } from "../store/projects-store";
import { LeftRailPortal } from "../shell/panel/LeftRailPortal";
import { activeTabIdSignal, documentTabsSignal } from "../store/document-tabs-store";
import { IMAGE_ACCEPT } from "./home-page/accept-formats";
import { ImageMetaPanel } from "../components/ImageMetaPanel";
import { useToolbarState } from "../components/toolbar/use-toolbar-state";
import { useCustomPresets } from "../hooks/useCustomPresets";
import { useSignalValue } from "../lib/signal";
import { themeSignal } from "../store/global-theme-store";
import { imageSignal, isSampleSignal, imageMetaSignal } from "../store/image-store";
import { compareModeSignal, transparentBgSignal, shareStateSignal } from "../store/editor-view-store";
import { trackEvent } from "../lib/tracker";
import { PrintFinishHint } from "../components/onboarding/PrintFinishHint";
import { useHomeInit } from "./home-page/use-home-init";
import { clearImageWithUndo } from "./home-page/clear-image-with-undo";
import { handleImageUploadFile } from "./home-page/upload/handle-image-upload";
import { loadSampleImage } from "./home-page/upload/load-sample-image";
import { EMPTY_STATE_SAMPLES } from "./home-page/empty-state/empty-state-samples";
import { handleMoshAction } from "./home-page/mosh/handle-mosh";
import { EDITOR_DOWNLOADS } from "./home-page/export/editor-downloads";
import { shareRecipe } from "./home-page/share/share-recipe";
import { EditorPreview } from "./home-page/preview/EditorPreview";
import { EditorTonePanel } from "../modules/grading/editor/EditorTonePanel";
import { EditorEmptyState } from "./home-page/empty-state/EditorEmptyState";

const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (file) void handleImageUploadFile(file, "picker");
};

const handleToggleTransparentBg = (): void => {
  const enabled = !transparentBgSignal.value;
  trackEvent("home", "transparent_bg_toggled", { details: { enabled } });
  transparentBgSignal.value = enabled;
};

const handleToggleCompare = (): void => {
  const enabled = !compareModeSignal.value;
  trackEvent("home", "compare_toggled", { details: { enabled } });
  compareModeSignal.value = enabled;
};

const handleClearImage = (): void => {
  trackEvent("home", "image_cleared", { details: { is_sample: isSampleSignal.value } });
  clearImageWithUndo();
};

const handleSharePreset = (): void => {
  void shareRecipe();
};

const handleLoadSample = (): void => {
  const sample = EMPTY_STATE_SAMPLES[Math.floor(Math.random() * EMPTY_STATE_SAMPLES.length)];
  loadSampleImage(sample.src);
};

const handleDownloadSvg = (transparent: boolean): void => {
  void EDITOR_DOWNLOADS.downloadSvg(transparent);
};

// Desktop darkroom. Web's editor body (preview, tone panel, empty state, the
// shared editor-view stores and download/share/clear actions) inside the desktop
// chrome: controls portal into the shell's left rail, export publishes to the
// title bar, and Save/Export register as native-menu commands.
export const Home: React.FC = () => {
  const isDark = useSignalValue(themeSignal) === "dark";
  const image = useSignalValue(imageSignal);
  const imageMeta = useSignalValue(imageMetaSignal);
  const compareMode = useSignalValue(compareModeSignal);
  const transparentBg = useSignalValue(transparentBgSignal);
  const shareState = useSignalValue(shareStateSignal);
  const { lutId, effectsData } = useToolbarState();
  const { customPresets, savePreset, deletePreset } = useCustomPresets();

  useHomeInit();

  // Publish the darkroom's export/share into the title bar while the darkroom is
  // the active surface. Re-published as the effect state changes so the export
  // always reflects the current document; cleared when the darkroom is hidden.
  const activeTabId = useSignalValue(activeTabIdSignal);
  const documentTabs = useSignalValue(documentTabsSignal);
  const darkroomActive =
    documentTabs.find((tab) => tab.id === activeTabId)?.kind === "darkroom";

  useEffect(() => {
    if (!darkroomActive || !image) return;
    setTitlebarActions(
      activeTabId,
      <DesktopExportButton
        transparentBg={transparentBg}
        onToggleTransparentBg={handleToggleTransparentBg}
        onDownloadRaster={EDITOR_DOWNLOADS.downloadRaster}
        onDownloadSvg={handleDownloadSvg}
        onSharePreset={handleSharePreset}
        shareState={shareState}
        isLUT={!!lutId}
        imageData={image ?? undefined}
        effectsData={effectsData}
      />,
    );
    return () => clearTitlebarActions(activeTabId);
  }, [activeTabId, darkroomActive, transparentBg, shareState, lutId, image, effectsData]);

  // Register the darkroom's native-menu commands while it is the active surface,
  // so the OS menu bar and right-click menu offer only Save and (when an image is
  // loaded) Export — never the studio-only canvas commands. Export opens the same
  // popover as the title-bar button.
  useEffect(() => {
    if (!darkroomActive) return;
    registerSurfaceCommands(activeTabId, {
      save: () => void saveActiveDarkroom(),
      ...(image
        ? { export: () => { desktopExportOpenSignal.value = true; } }
        : {}),
    });
    return () => clearSurfaceCommands(activeTabId);
  }, [darkroomActive, activeTabId, image]);

  return (
    <div
      className={`stagger-reveal relative flex h-full w-full flex-col overflow-hidden select-none bg-[var(--s-bg-canvas)] ${isDark ? "dark" : ""}`}
    >
      <LeftRailPortal active={darkroomActive}>
        <DarkroomPanel
          onImageUpload={handleImageUpload}
          onMosh={handleMoshAction}
          onClear={handleClearImage}
          onLoadSample={handleLoadSample}
          compareMode={compareMode}
          onToggleCompare={handleToggleCompare}
          transparentBg={transparentBg}
          onToggleTransparentBg={handleToggleTransparentBg}
          customPresets={customPresets}
          onSaveCustomPreset={savePreset}
          onDeleteCustomPreset={deletePreset}
          imageAccept={IMAGE_ACCEPT}
        />
      </LeftRailPortal>

      {image && imageMeta && <ImageMetaPanel meta={imageMeta} />}

      {image ? (
        <EditorPreview image={image} />
      ) : (
        <div className="flex-1 w-full min-h-0 relative">
          {/* The empty state listens for drops and pastes on the whole window, so it
              mounts only while the darkroom is the visible surface. */}
          {darkroomActive && <EditorEmptyState onUpload={handleImageUpload} />}
        </div>
      )}

      <PrintFinishHint />

      <EditorTonePanel />
    </div>
  );
};
