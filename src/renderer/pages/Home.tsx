import { useState, useCallback, useEffect } from "react";
import { OutputPreview } from "../components/OutputPreview";
import { DarkroomPanel } from "./home-page/panel/DarkroomPanel";
import { DesktopExportButton, desktopExportOpenSignal } from "../components/toolbar/DesktopExportButton";
import { setTitlebarActions, clearTitlebarActions } from "../store/titlebar-actions-store";
import { registerSurfaceCommands, clearSurfaceCommands } from "../store/surface-commands-store";
import { saveActiveDarkroom } from "../store/projects-store";
import { LeftRailPortal } from "../shell/panel/LeftRailPortal";
import { activeTabIdSignal, documentTabsSignal } from "../store/document-tabs-store";
import { IMAGE_ACCEPT } from "./home-page/accept-formats";
import { ImageMetaPanel } from "../components/ImageMetaPanel";
import { EmptyState } from "../components/EmptyState";
import { usePayment } from "../hooks/usePayment";
import { useCustomPresets } from "../hooks/useCustomPresets";
import { useSignalValue } from "../lib/signal";
import { themeSignal } from "../store/global-theme-store";
import {
  imageSignal,
  isSampleSignal,
  imageMetaSignal,
  revokeCurrentObjectUrl,
} from "../store/image-store";
import {
  modesSignal,
  lutIdSignal,
  ditherMethodSignal,
  ditherFactorSignal,
  resolutionSignal,
  contrastSignal,
  brightnessSignal,
  saturationSignal,
  grainSignal,
  hueSignal,
  printFinishSignal,
  printFinishStrengthSignal,
  paletteSignal,
  isColorSignal,
  asciiCharsetSignal,
  asciiToneSignal,
  asciiDensitySignal,
  asciiEdgesSignal,
  asciiEdgeThresholdSignal,
  contourLevelsSignal,
  contourFillSignal,
  hazeIntensitySignal,
  bloomIntensitySignal,
  bloomThresholdSignal,
  hazeWarmthSignal,
  halftoneCellSignal,
  halftoneAngleSignal,
  halftoneStyleSignal,
  halftoneShapeSignal,
  halftoneInvertSignal,
  halftoneIntensitySignal,
  halftoneSharpnessSignal,
  popartCellSignal,
  popartAngleSignal,
  popartThresholdSignal,
  popartGrainSignal,
  popartSpatterSignal,
  popartInkSignal,
  popartPaperSignal,
  inkwashDetailSignal,
  inkwashBandsSignal,
  inkwashBleedSignal,
  inkwashInkSignal,
  inkwashPaperSignal,
  mangaCellSignal,
  mangaAngleSignal,
  mangaLineWeightSignal,
  mangaContrastSignal,
  captureSnapshot,
} from "../store/transform-store";
import { trackEvent as trackPosthog } from "../lib/analytics";
import { trackEvent } from "../lib/tracker";
import { emitModal } from "../lib/event-bus";
import { encodeRecipeUrl } from "../utils/recipe-url";
import { clearImageFromDB } from "../utils/indexed-db";
import { PrintFinishHint } from "../components/onboarding/PrintFinishHint";
import { useHomeInit } from "./home-page/use-home-init";
import { handleImageUploadFile, loadSampleImage } from "./home-page/handle-image-upload";
import { handleMoshAction } from "./home-page/handle-mosh";
import { triggerRasterDownload, triggerSvgDownload } from "./home-page/download-handlers";
import type { DownloadRasterFn } from "../engine/export/export-types";
import { PreviewLoader } from "./home-page/PreviewLoader";

const BG_COLOR_LIGHT = "#fdf6e3";
const SAMPLE_IMAGES = [
  "/sample.jpg",
  "/sample2.jpeg",
  "/sample3.jpg",
  "/sample4.png",
  "/sample5.jpeg",
  "/sample7.jpeg",
  "/sample8.jpeg",
  "/sample9.jpeg",
  "/sample10.jpeg",
  "/sample11.jpeg",
  "/sample12.jpeg",
  "/sample13.jpeg",
  "/sample14.jpeg",
  "/sample15.jpeg",
  "/sample16.jpeg",
];
const SHARE_TOAST_MS = 2000;
const LUT_DEFAULT_RESOLUTION = 2.0;

export const Home = () => {
  const [compareMode, setCompareMode] = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const isDark = useSignalValue(themeSignal) === "dark";

  const image = useSignalValue(imageSignal);
  const isSample = useSignalValue(isSampleSignal);
  const imageMeta = useSignalValue(imageMetaSignal);
  const modes = useSignalValue(modesSignal);
  const lutId = useSignalValue(lutIdSignal);
  const resolution = useSignalValue(resolutionSignal);
  const contrast = useSignalValue(contrastSignal);
  const brightness = useSignalValue(brightnessSignal);
  const saturation = useSignalValue(saturationSignal);
  const ditherMethod = useSignalValue(ditherMethodSignal);
  const ditherFactor = useSignalValue(ditherFactorSignal);
  const isColor = useSignalValue(isColorSignal);
  const asciiCharset = useSignalValue(asciiCharsetSignal);
  const asciiTone = useSignalValue(asciiToneSignal);
  const asciiDensity = useSignalValue(asciiDensitySignal);
  const asciiEdges = useSignalValue(asciiEdgesSignal);
  const asciiEdgeThreshold = useSignalValue(asciiEdgeThresholdSignal);
  const contourLevels = useSignalValue(contourLevelsSignal);
  const contourFill = useSignalValue(contourFillSignal);
  const grain = useSignalValue(grainSignal);
  const hue = useSignalValue(hueSignal);
  const printFinish = useSignalValue(printFinishSignal);
  const printFinishStrength = useSignalValue(printFinishStrengthSignal);
  const palette = useSignalValue(paletteSignal);
  const hazeIntensity = useSignalValue(hazeIntensitySignal);
  const bloomIntensity = useSignalValue(bloomIntensitySignal);
  const bloomThreshold = useSignalValue(bloomThresholdSignal);
  const hazeWarmth = useSignalValue(hazeWarmthSignal);
  const halftoneCell = useSignalValue(halftoneCellSignal);
  const halftoneAngle = useSignalValue(halftoneAngleSignal);
  const halftoneStyle = useSignalValue(halftoneStyleSignal);
  const halftoneShape = useSignalValue(halftoneShapeSignal);
  const halftoneInvert = useSignalValue(halftoneInvertSignal);
  const halftoneIntensity = useSignalValue(halftoneIntensitySignal);
  const halftoneSharpness = useSignalValue(halftoneSharpnessSignal);
  const popartCell = useSignalValue(popartCellSignal);
  const popartAngle = useSignalValue(popartAngleSignal);
  const popartThreshold = useSignalValue(popartThresholdSignal);
  const popartGrain = useSignalValue(popartGrainSignal);
  const popartSpatter = useSignalValue(popartSpatterSignal);
  const popartInk = useSignalValue(popartInkSignal);
  const popartPaper = useSignalValue(popartPaperSignal);
  const inkwashDetail = useSignalValue(inkwashDetailSignal);
  const inkwashBands = useSignalValue(inkwashBandsSignal);
  const inkwashBleed = useSignalValue(inkwashBleedSignal);
  const inkwashInk = useSignalValue(inkwashInkSignal);
  const inkwashPaper = useSignalValue(inkwashPaperSignal);
  const mangaCell = useSignalValue(mangaCellSignal);
  const mangaAngle = useSignalValue(mangaAngleSignal);
  const mangaLineWeight = useSignalValue(mangaLineWeightSignal);
  const mangaContrast = useSignalValue(mangaContrastSignal);

  const { credits } = usePayment();
  const { customPresets, savePreset, deletePreset } = useCustomPresets();

  useHomeInit();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await handleImageUploadFile(file, setCompareMode);
    } catch (err) {
      console.error("image upload failed:", err);
      emitModal({ type: "heic-status", status: "done", format: "heic" });
    }
  };

  const handleDropFile = useCallback((file: File) => {
    handleImageUploadFile(file, setCompareMode).catch((err) => {
      console.error("image drop failed:", err);
      emitModal({ type: "heic-status", status: "done", format: "heic" });
    });
  }, []);

  const handleLoadSample = useCallback(() => {
    loadSampleImage(SAMPLE_IMAGES);
  }, []);

  const handleDownloadRaster: DownloadRasterFn = ({ format, scale, transparent, quality }) => {
    triggerRasterDownload({
      format, scale, transparent, bgColor: BG_COLOR_LIGHT, lutId, isSample,
      modes, resolution, contrast, brightness, saturation, grain,
      ditherMethod, ditherFactor,
      watermark: credits.plan === "free",
      quality,
      plan: credits.plan,
    });
  };

  const handleDownloadSvg = (transparent = false) => {
    triggerSvgDownload({
      transparent, bgColor: BG_COLOR_LIGHT, isSample, modes, ditherMethod, plan: credits.plan,
    });
  };

  const handleSharePreset = () => {
    const snap = captureSnapshot();
    const url = encodeRecipeUrl(snap);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareState("copied");
        trackPosthog("preset_shared", {
          modes: snap.modes,
          dither_method: snap.ditherMethod,
          is_color: snap.isColor,
          palette_id: snap.palette?.id ?? null,
        });
        trackEvent("home", "preset_shared");
        setTimeout(() => setShareState("idle"), SHARE_TOAST_MS);
      })
      .catch((err) => {
        console.error("clipboard write failed:", err);
        setShareState("idle");
      });
  };

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
        credits={credits}
        transparentBg={transparentBg}
        onToggleTransparentBg={() => setTransparentBg((prev) => !prev)}
        onDownloadRaster={handleDownloadRaster}
        onDownloadSvg={handleDownloadSvg}
        onSharePreset={handleSharePreset}
        shareState={shareState}
        isLUT={!!lutId}
        imageData={image ?? undefined}
        effectsData={{
          modes: modes as unknown as string[],
          lutId,
          ditherMethod: ditherMethod as unknown as string,
          ditherFactor,
          resolution, contrast, brightness, saturation, grain, hue, isColor,
          palette: palette
            ? { id: palette.id, colors: palette.colors.map((c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`) }
            : null,
          hazeIntensity, bloomIntensity, bloomThreshold,
          hazeWarmth: hazeWarmth as unknown as string,
        }}
      />,
    );
    return () => clearTitlebarActions(activeTabId);
    // Handlers close over the same effect values already in the dep list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, darkroomActive, credits, transparentBg, shareState, lutId, image, modes,
      ditherMethod, ditherFactor, resolution, contrast, brightness, saturation,
      grain, hue, isColor, palette, hazeIntensity, bloomIntensity, bloomThreshold, hazeWarmth]);

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

  // Publish the darkroom's control panel into the shell's full-height left rail
  // while the darkroom is the active surface (cleared otherwise). Re-published as
  // the toggles/presets change so the panel reflects the live document.
  const handleClear = useCallback(() => {
    imageSignal.value = null;
    revokeCurrentObjectUrl();
    clearImageFromDB();
    localStorage.removeItem("imgi_image_meta");
    localStorage.removeItem("imgi_is_sample");
    localStorage.removeItem("imgi_sample_path");
  }, []);

  return (
    <div
      className={`stagger-reveal relative flex h-full w-full flex-col overflow-hidden select-none bg-[var(--s-bg-canvas)] ${isDark ? "dark" : ""}`}
    >
      <LeftRailPortal active={darkroomActive}>
        <DarkroomPanel
          onImageUpload={handleImageUpload}
          onMosh={handleMoshAction}
          onClear={handleClear}
          onLoadSample={handleLoadSample}
          compareMode={compareMode}
          onToggleCompare={() => setCompareMode((v) => !v)}
          transparentBg={transparentBg}
          onToggleTransparentBg={() => setTransparentBg((v) => !v)}
          customPresets={customPresets}
          onSaveCustomPreset={savePreset}
          onDeleteCustomPreset={deletePreset}
          imageAccept={IMAGE_ACCEPT}
        />
      </LeftRailPortal>

      {imageMeta && <ImageMetaPanel meta={imageMeta} />}

      {image && isSample && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
            Sample image, SVG export unlocked
          </span>
        </div>
      )}

      {image ? (
        <div className="flex-1 w-full flex items-center justify-center p-4 md:p-8 min-h-0 relative">
          <PreviewLoader />
          <OutputPreview
            image={image}
            compareMode={compareMode}
            transparentBg={transparentBg}
            resolution={lutId ? LUT_DEFAULT_RESOLUTION : resolution}
            contrast={lutId ? 1.0 : contrast}
            brightness={lutId ? 1.0 : brightness}
            saturation={lutId ? 1.0 : saturation}
            mode={
              lutId
                ? modes.includes("haze-bloom")
                  ? ["haze-bloom", "lut"]
                  : ["lut"]
                : modes
            }
            ditherMethod={ditherMethod}
            ditherFactor={ditherFactor}
            isColor={lutId ? true : isColor}
            asciiCharset={asciiCharset}
            asciiTone={asciiTone}
            asciiDensity={asciiDensity}
            asciiEdges={asciiEdges}
            asciiEdgeThreshold={asciiEdgeThreshold}
            contourLevels={contourLevels}
            contourFill={contourFill}
            noise={lutId ? 0 : grain}
            hue={lutId ? 0 : hue}
            printFinish={printFinish}
            printFinishStrength={printFinishStrength}
            palette={lutId ? undefined : palette || undefined}
            lutId={lutId ?? undefined}
            fgColor="#000000"
            bgColor={BG_COLOR_LIGHT}
            onResult={() => {}}
            hazeIntensity={hazeIntensity}
            bloomIntensity={bloomIntensity}
            bloomThreshold={bloomThreshold}
            hazeWarmth={hazeWarmth}
            halftoneCell={halftoneCell}
            halftoneAngle={halftoneAngle}
            halftoneStyle={halftoneStyle}
            halftoneShape={halftoneShape}
            halftoneInvert={halftoneInvert}
            halftoneIntensity={halftoneIntensity}
            halftoneSharpness={halftoneSharpness}
            popartCell={popartCell}
            popartAngle={popartAngle}
            popartThreshold={popartThreshold}
            popartGrain={popartGrain}
            popartSpatter={popartSpatter}
            popartInk={popartInk}
            popartPaper={popartPaper}
            inkwashDetail={inkwashDetail}
            inkwashBands={inkwashBands}
            inkwashBleed={inkwashBleed}
            inkwashInk={inkwashInk}
            inkwashPaper={inkwashPaper}
            mangaCell={mangaCell}
            mangaAngle={mangaAngle}
            mangaLineWeight={mangaLineWeight}
            mangaContrast={mangaContrast}
          />
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <EmptyState
            onUpload={handleImageUpload}
            onUploadFile={handleDropFile}
            onLoadSample={handleLoadSample}
            isDark={isDark}
          />
        </div>
      )}

      <PrintFinishHint />
    </div>
  );
};
