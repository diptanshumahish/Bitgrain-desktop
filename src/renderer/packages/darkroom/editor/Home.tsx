import React from "react";
import { usePayment } from "@bitgrain/platform/billing/use-payment";
import { useCustomPresets } from "../presets/use-custom-presets";
import { useSignalValue } from "@bitgrain/core/signal";
import { themeSignal } from "@bitgrain/ui/theme/global-theme-store";
import { imageSignal, isSampleSignal } from "../state/image-store";
import { compareModeSignal, transparentBgSignal } from "../state/editor-view-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { HomeHeader } from "./HomeHeader";
import { EditorTopBar } from "./topbar/EditorTopBar";
import { IMAGE_ACCEPT } from "./accept-formats";
import { EditorWorkspace } from "./workspace/EditorWorkspace";
import { PrintFinishHint } from "./hints/PrintFinishHint";
import { useHomeInit } from "./use-home-init";
import { clearImageWithUndo } from "./clear-image-with-undo";
import { handleImageUploadFile } from "./upload/handle-image-upload";
import { handleMoshAction } from "./mosh/handle-mosh";
import { EDITOR_DOWNLOADS } from "./export/editor-downloads";
import { shareRecipe } from "./share/share-recipe";
import { EditorPreview } from "./preview/EditorPreview";
import { SampleStartPrompt } from "./sample-start/SampleStartPrompt";
import { PendingRecipeBanner } from "./session/PendingRecipeBanner";
import { EditorEmptyState } from "./empty-state/EditorEmptyState";
import { ImageIntake } from "./intake/ImageIntake";
import { PopoverPortal } from "@bitgrain/ui/overlays/PopoverPortal";

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

export const Home: React.FC = () => {
  const isDark = useSignalValue(themeSignal) === "dark";
  const image = useSignalValue(imageSignal);
  usePayment();
  const { customPresets, savePreset, deletePreset } = useCustomPresets();

  useHomeInit();

  const callbacks = {
    onImageUpload: handleImageUpload,
    onMosh: handleMoshAction,
    onDownloadRaster: EDITOR_DOWNLOADS.downloadRaster,
    onDownloadSvg: EDITOR_DOWNLOADS.downloadSvg,
    onSharePreset: handleSharePreset,
    onToggleTransparentBg: handleToggleTransparentBg,
    customPresets,
    onSaveCustomPreset: savePreset,
    onDeleteCustomPreset: deletePreset,
  };

  return (
    <div
      className={`stagger-reveal h-full w-full flex flex-col overflow-hidden select-none relative bg-[var(--s-bg-canvas)] ${isDark ? "dark" : ""}`}
    >
      <EditorTopBar
        hasImage={!!image}
        onToggleCompare={handleToggleCompare}
        onImageUpload={handleImageUpload}
        imageAccept={IMAGE_ACCEPT}
      />
      <HomeHeader isDark={isDark} hasImage={!!image} />

      <EditorWorkspace
        callbacks={callbacks}
        onToggleCompare={handleToggleCompare}
        onClear={handleClearImage}
      >
        {image && <SampleStartPrompt />}
        {image ? (
          <EditorPreview image={image} />
        ) : (
          <div className="flex-1 w-full min-h-0 relative">
            <PendingRecipeBanner />
            <EditorEmptyState onUpload={handleImageUpload} />
          </div>
        )}
      </EditorWorkspace>

      <ImageIntake />

      <PrintFinishHint />

      <PopoverPortal />
    </div>
  );
};
