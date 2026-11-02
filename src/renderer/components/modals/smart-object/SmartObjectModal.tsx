import React, { useEffect, useState } from "react";
import { resolveExportPlan } from "../../../lib/plan-gate/resolve-export-plan";
import { X, Download, Plus, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { themeSignal } from "../../../store/global-theme-store";
import { renderToCanvas } from "../../studio/hooks/export/render-canvas";
import { composeSmartObject } from "../../../engine/mockup/compose-smart-object";
import { isSmartObjectSupported } from "../../../engine/mockup/warp-renderer";
import { DEFAULT_SMART_OBJECT_SETTINGS, DEFAULT_CORNERS } from "../../../engine/mockup/mockup-types";
import { BasePhotoPicker } from "./BasePhotoPicker";
import { SmartObjectStage } from "./SmartObjectStage";
import { SmartObjectControls } from "./SmartObjectControls";
import { ArtworkSourcePicker } from "./ArtworkSourcePicker";
import { StageToolbar } from "./StageToolbar";
import { renderWholeDesign, renderLayerArtwork, canvasFromImage } from "./artwork-source";
import { rotateArtworkQuarterTurn, mirrorArtwork } from "./artwork-transform";
import { detectSurfaceQuad } from "../../../engine/mockup/detect/detect-surface-quad";
import { loadImage } from "../mockups-api";
import { gateCanvasForPlan } from "../../../lib/plan-gate/gate-canvas-for-plan";
import { trackEvent } from "../../../lib/tracker";
import type { ArtworkSourceKind, ArtworkRequest } from "./artwork-source";
import type { MockupQuad, SmartObjectSettings } from "../../../engine/mockup/mockup-types";
import type { TemplateDef, Layer } from "../../../data/studioTypes";

interface SmartObjectModalProps {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  width: number;
  height: number;
  selectedLayer: Layer | null;
  onAddPage: (dataUrl: string, width: number, height: number) => void;
  onClose: () => void;
}

const download = (dataUrl: string, name: string): void => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = name;
  link.click();
};

export const SmartObjectModal: React.FC<SmartObjectModalProps> = ({
  template,
  background,
  layers,
  image,
  width,
  height,
  selectedLayer,
  onAddPage,
  onClose,
}) => {
  const dark = useSignalValue(themeSignal) === "dark";
  const [artwork, setArtwork] = useState<HTMLCanvasElement | null>(null);
  const [base, setBase] = useState<HTMLImageElement | null>(null);
  const [corners, setCorners] = useState<MockupQuad>(DEFAULT_CORNERS);
  const [settings, setSettings] = useState<SmartObjectSettings>(DEFAULT_SMART_OBJECT_SETTINGS);
  const [sourceKind, setSourceKind] = useState<ArtworkSourceKind>("design");
  const [snapToEdges, setSnapToEdges] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [detectionFailed, setDetectionFailed] = useState(false);

  const artworkRequest: ArtworkRequest = { template, background, layers, image, width, height };

  const applyDetection = (photo: HTMLImageElement, fallback: MockupQuad): void => {
    const detected = detectSurfaceQuad(photo);
    setDetectionFailed(!detected);
    setCorners(detected ?? fallback);
  };

  const transformArtwork = (transform: (source: HTMLCanvasElement) => HTMLCanvasElement): void => {
    setArtwork((current) => (current ? transform(current) : current));
  };

  useEffect(() => {
    let cancelled = false;
    const run = async (): Promise<void> => {
      const rendered = await renderToCanvas({ ...template, width, height }, background, layers, image, width, height);
      if (!cancelled) setArtwork(rendered);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [template, background, layers, image, width, height]);

  const pickDesign = async (): Promise<void> => {
    setSourceKind("design");
    setArtwork(await renderWholeDesign(artworkRequest));
  };

  const pickLayer = async (): Promise<void> => {
    if (!selectedLayer) return;
    setSourceKind("layer");
    setArtwork(await renderLayerArtwork(artworkRequest, selectedLayer));
  };

  const pickUpload = async (file: File): Promise<void> => {
    const objectUrl = URL.createObjectURL(file);
    try {
      const uploaded = await loadImage(objectUrl);
      setSourceKind("upload");
      setArtwork(canvasFromImage(uploaded));
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const compose = (): HTMLCanvasElement | null => {
    if (!base || !artwork) return null;
    return composeSmartObject({
      base,
      artwork,
      corners,
      settings,
      width: base.naturalWidth,
      height: base.naturalHeight,
    });
  };

  const handleAddPage = (): void => {
    const composed = compose();
    if (composed) onAddPage(composed.toDataURL("image/png"), composed.width, composed.height);
  };

  const handleDownload = async (): Promise<void> => {
    const plan = await resolveExportPlan();
    if (!plan) return;
    const composed = compose();
    if (!composed) return;
    const gated = await gateCanvasForPlan(composed, plan);
    download(gated.toDataURL("image/png"), "bitgrain-mockup.png");
    trackEvent("studio", "mockup_downloaded", { details: { plan: plan } });
  };

  const supported = isSmartObjectSupported();
  const panelClass = dark ? "bg-[#141414] border-white/10" : "bg-white border-black/5";
  const dividerClass = dark ? "border-white/5" : "border-black/5";
  const actionClass = dark ? "text-zinc-400 hover:bg-white/5" : "text-zinc-500 hover:bg-zinc-100";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl border animate-in fade-in slide-in-from-bottom-3 duration-200 font-sans ${panelClass}`}>
        <div className={`flex items-start justify-between px-6 pt-5 pb-4 border-b ${dividerClass}`}>
          <div className="flex items-start gap-3">
            {base && (
              <button onClick={() => setBase(null)} title="pick another photo" className={`w-8 h-8 flex items-center justify-center rounded-lg ${actionClass}`}>
                <ArrowLeft size={16} strokeWidth={2} />
              </button>
            )}
            <div>
              <h2 className={`text-[18px] font-medium ${dark ? "text-white" : "text-zinc-900"}`}>place artwork</h2>
              <p className={`text-[12px] mt-1 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                drag the four corners onto a surface, your design bends to fit and picks up its light.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/docs/05-studio-advanced/05-mockups"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] font-medium no-underline transition-colors ${dark ? "text-zinc-500 hover:bg-zinc-800 hover:text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
            >
              <BookOpen size={12} /> Guide
            </a>
            <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${dark ? "text-zinc-500 hover:bg-zinc-800" : "text-zinc-400 hover:bg-zinc-100"}`}>
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {!supported && (
          <p className="px-6 py-10 text-[12px] text-center text-zinc-500">
            this browser does not support webgl2, so artwork placement is unavailable here.
          </p>
        )}

        {supported && !artwork && (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-zinc-500">
            <Loader2 size={20} className="animate-spin" />
            <p className="text-[12px]">preparing your design...</p>
          </div>
        )}

        {supported && artwork && !base && (
          <div className="p-5">
            <BasePhotoPicker
              dark={dark}
              onSelect={(selected, selectedCorners) => {
                setBase(selected);
                applyDetection(selected, selectedCorners);
              }}
            />
          </div>
        )}

        {supported && artwork && base && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-5 p-5">
            <div className="flex flex-col gap-2">
              <SmartObjectStage
                base={base}
                artwork={artwork}
                corners={corners}
                settings={settings}
                snapToEdges={snapToEdges}
                showGuides={showGuides}
                onCornersChange={setCorners}
              />
              <p className={`text-[11px] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                {detectionFailed
                  ? "could not find a surface here, drag the four dots onto its corners"
                  : "found a surface, drag any dot to adjust it. hold shift to keep an edge straight"}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <StageToolbar
                dark={dark}
                snapToEdges={snapToEdges}
                showGuides={showGuides}
                onToggleSnap={() => setSnapToEdges((current) => !current)}
                onToggleGuides={() => setShowGuides((current) => !current)}
                onDetect={() => base && applyDetection(base, corners)}
                onRotate={() => transformArtwork(rotateArtworkQuarterTurn)}
                onFlipHorizontal={() => transformArtwork((source) => mirrorArtwork(source, true))}
                onFlipVertical={() => transformArtwork((source) => mirrorArtwork(source, false))}
              />
              <ArtworkSourcePicker
                dark={dark}
                active={sourceKind}
                selectedLayer={selectedLayer}
                onPickDesign={() => void pickDesign()}
                onPickLayer={() => void pickLayer()}
                onPickUpload={(file) => void pickUpload(file)}
              />
              <SmartObjectControls settings={settings} dark={dark} onChange={setSettings} />
              <div className={`flex items-center gap-2 pt-3 border-t ${dividerClass}`}>
                <button onClick={handleAddPage} className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] ${actionClass}`}>
                  <Plus size={15} strokeWidth={2} />
                  add as page
                </button>
                <button onClick={() => void handleDownload()} className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] ${actionClass}`}>
                  <Download size={15} strokeWidth={2} />
                  png
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
