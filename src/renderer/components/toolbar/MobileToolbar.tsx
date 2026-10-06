import React, { useState } from "react";
import {
  Plus, SlidersHorizontal, LayoutTemplate, Download, Layers,
  Undo2, Redo2, Wand2, Columns2, Crop, Dice5, Trash2, X, MoreHorizontal,
} from "lucide-react";
import { ExportPopover } from "./ExportPopover";
import { MorePopover } from "./MorePopover";
import { FiltersPopover } from "./popovers/FiltersPopover";
import { PalettePopover } from "./popovers/PalettePopover";
import { AlgorithmPopover } from "./popovers/AlgorithmPopover";
import { AdjustPopover } from "./popovers/AdjustPopover";
import { PresetsPopover } from "./popovers/PresetsPopover";
import { LUTPopover } from "./popovers/LUTPopover";
import { HazeBloomPopover } from "./popovers/HazeBloomPopover";
import { HalftonePopover } from "./popovers/HalftonePopover";
import { PopArtPopover } from "./popovers/PopArtPopover";
import { AsciiPopover } from "./popovers/AsciiPopover";
import { BraillePopover } from "./popovers/BraillePopover";
import { ContourPopover } from "./popovers/ContourPopover";
import { InkWashPopover } from "./popovers/InkWashPopover";
import { MangaPopover } from "./popovers/MangaPopover";
import { MobileEffectsSheet } from "./MobileEffectsSheet";
import { undoHistory, redoHistory } from "../../store/history-store";
import { emitModal } from "../../lib/event-bus";
import type { ToolbarState } from "./use-toolbar-state";
import type { ActivePopover, ToolbarCallbacks } from "./DesktopToolbar";

interface MobileToolbarProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  callbacks: ToolbarCallbacks;
  onClear: () => void;
  onToggleCompare: () => void;
  compareMode: boolean;
  imageAccept: string;
}

interface PrimaryTabProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const PrimaryTab: React.FC<PrimaryTabProps> = ({ icon, label, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center gap-1 min-h-[54px] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
      active
        ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
        : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium leading-none">{label}</span>
  </button>
);

interface UtilBtnProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const UtilBtn: React.FC<UtilBtnProps> = ({ icon, label, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      active
        ? "text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
        : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"
    }`}
  >
    {icon}
  </button>
);

export const MobileToolbar: React.FC<MobileToolbarProps> = ({
  state, active, toggle, close, callbacks, onClear, onToggleCompare, compareMode, imageAccept,
}) => {
  const s = state;
  const [showEffects, setShowEffects] = useState(false);

  const closeAll = (): void => {
    setShowEffects(false);
    close();
  };

  const effectsActive =
    s.mode.includes("dither") || s.isHalftoneActive || s.mode.includes("popart") ||
    !!s.lutId || s.hasActiveHazeBloom || s.hasActiveFilters || !!s.palette;

  const sheetOpen = !!active || showEffects;
  const sheetTitle = showEffects ? "effects" : active ?? "";

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 font-editorial">
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px]" onClick={closeAll} />
          <div className="fixed bottom-[124px] left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-24px)] bg-[var(--s-bg-panel)] rounded-2xl border border-black/5 overflow-hidden animate-popover max-h-[58vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[var(--s-border)]">
              <span className="text-sm font-medium text-[var(--s-text)] capitalize">{sheetTitle}</span>
              <button onClick={closeAll} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"><X size={15} strokeWidth={2} /></button>
            </div>
            {showEffects && <MobileEffectsSheet state={s} toggle={toggle} onClose={() => setShowEffects(false)} />}
            {active === "more" && <MorePopover onClose={close} />}
            {active === "export" && <ExportPopover credits={callbacks.credits} transparentBg={callbacks.transparentBg} onToggleTransparentBg={callbacks.onToggleTransparentBg} onDownloadRaster={callbacks.onDownloadRaster} onDownloadSvg={callbacks.onDownloadSvg} onSharePreset={callbacks.onSharePreset} shareState={callbacks.shareState} isLUT={!!s.lutId} imageData={s.image ?? undefined} effectsData={s.effectsData} onClose={close} />}
            {active === "filters" && <FiltersPopover mode={s.mode} setMode={s.setMode} onClose={close} static />}
            {active === "palette" && <PalettePopover palette={s.palette} setPalette={s.setPalette} onClose={close} static />}
            {active === "algorithm" && <AlgorithmPopover ditherMethod={s.ditherMethod} setDitherMethod={s.setDitherMethod} ditherFactor={s.ditherFactor} setDitherFactor={s.setDitherFactor} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "adjust" && <AdjustPopover resolution={s.resolution} setResolution={s.setResolution} contrast={s.contrast} setContrast={s.setContrast} brightness={s.brightness} setBrightness={s.setBrightness} saturation={s.saturation} setSaturation={s.setSaturation} grain={s.grain} setGrain={s.setGrain} hue={s.hue} setHue={s.setHue} printFinish={s.printFinish} setPrintFinish={s.setPrintFinish} printFinishStrength={s.printFinishStrength} setPrintFinishStrength={s.setPrintFinishStrength} mode={s.mode} filmGrain={s.isGrainActive} onToggleFilmGrain={s.toggleFilmGrain} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "presets" && <PresetsPopover onApplyPreset={s.applyPreset} onClose={close} currentConfig={s.currentConfig} customPresets={callbacks.customPresets} onSaveCustomPreset={callbacks.onSaveCustomPreset} onDeleteCustomPreset={callbacks.onDeleteCustomPreset} static />}
            {active === "lut" && <LUTPopover activeLutId={s.lutId} onSelectLUT={(id) => { s.handleSelectLUT(id); if (id) close(); }} onClose={close} static />}
            {active === "haze-bloom" && <HazeBloomPopover mode={s.mode} onToggle={s.toggleHazeBloom} hazeIntensity={s.hazeIntensity} setHazeIntensity={s.setHazeIntensity} bloomIntensity={s.bloomIntensity} setBloomIntensity={s.setBloomIntensity} bloomThreshold={s.bloomThreshold} setBloomThreshold={s.setBloomThreshold} hazeWarmth={s.hazeWarmth} setHazeWarmth={s.setHazeWarmth} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "halftone" && <HalftonePopover mode={s.mode} onToggle={s.toggleHalftone} halftoneCell={s.halftoneCell} setHalftoneCell={s.setHalftoneCell} halftoneAngle={s.halftoneAngle} setHalftoneAngle={s.setHalftoneAngle} halftoneStyle={s.halftoneStyle} setHalftoneStyle={s.setHalftoneStyle} halftoneShape={s.halftoneShape} setHalftoneShape={s.setHalftoneShape} halftoneInvert={s.halftoneInvert} setHalftoneInvert={s.setHalftoneInvert} halftoneIntensity={s.halftoneIntensity} setHalftoneIntensity={s.setHalftoneIntensity} halftoneSharpness={s.halftoneSharpness} setHalftoneSharpness={s.setHalftoneSharpness} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "popart" && <PopArtPopover mode={s.mode} onToggle={s.togglePopart} popartCell={s.popartCell} setPopartCell={s.setPopartCell} popartAngle={s.popartAngle} setPopartAngle={s.setPopartAngle} popartThreshold={s.popartThreshold} setPopartThreshold={s.setPopartThreshold} popartGrain={s.popartGrain} setPopartGrain={s.setPopartGrain} popartSpatter={s.popartSpatter} setPopartSpatter={s.setPopartSpatter} popartInk={s.popartInk} setPopartInk={s.setPopartInk} popartPaper={s.popartPaper} setPopartPaper={s.setPopartPaper} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "ascii" && <AsciiPopover charset={s.asciiCharset} setCharset={s.setAsciiCharset} tone={s.asciiTone} setTone={s.setAsciiTone} density={s.asciiDensity} setDensity={s.setAsciiDensity} edges={s.asciiEdges} setEdges={s.setAsciiEdges} edgeThreshold={s.asciiEdgeThreshold} setEdgeThreshold={s.setAsciiEdgeThreshold} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "braille" && <BraillePopover density={s.asciiDensity} setDensity={s.setAsciiDensity} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "contour" && <ContourPopover levels={s.contourLevels} setLevels={s.setContourLevels} fill={s.contourFill} setFill={s.setContourFill} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "inkwash" && <InkWashPopover mode={s.mode} onToggle={s.toggleInkwash} inkwashDetail={s.inkwashDetail} setInkwashDetail={s.setInkwashDetail} inkwashBands={s.inkwashBands} setInkwashBands={s.setInkwashBands} inkwashBleed={s.inkwashBleed} setInkwashBleed={s.setInkwashBleed} inkwashInk={s.inkwashInk} setInkwashInk={s.setInkwashInk} inkwashPaper={s.inkwashPaper} setInkwashPaper={s.setInkwashPaper} onStateChangeFinished={s.onDone} onClose={close} static />}
            {active === "manga" && <MangaPopover mode={s.mode} onToggle={s.toggleManga} mangaCell={s.mangaCell} setMangaCell={s.setMangaCell} mangaAngle={s.mangaAngle} setMangaAngle={s.setMangaAngle} mangaLineWeight={s.mangaLineWeight} setMangaLineWeight={s.setMangaLineWeight} mangaContrast={s.mangaContrast} setMangaContrast={s.setMangaContrast} onStateChangeFinished={s.onDone} onClose={close} static />}
          </div>
        </>
      )}

      <div className="bg-[var(--s-bg-panel)]/95 backdrop-blur-xl border-t border-black/5 rounded-t-2xl pb-safe">
        <div className="flex items-center justify-center gap-0.5 px-3 pt-2.5">
          <UtilBtn icon={<Undo2 size={16} strokeWidth={2} />} label="undo" onClick={undoHistory} disabled={!s.canUndo} />
          <UtilBtn icon={<Redo2 size={16} strokeWidth={2} />} label="redo" onClick={redoHistory} disabled={!s.canRedo} />
          <div className="w-px h-5 bg-[var(--s-border)] mx-1 self-center" />
          <UtilBtn icon={<Wand2 size={16} strokeWidth={2} />} label="color" active={s.isColor} onClick={s.toggleIsColor} disabled={!s.hasImage} />
          <UtilBtn icon={<Columns2 size={16} strokeWidth={2} />} label="compare" active={compareMode} onClick={onToggleCompare} disabled={!s.hasImage} />
          <UtilBtn icon={<Crop size={16} strokeWidth={2} />} label="crop" onClick={() => emitModal({ type: "crop" })} disabled={!s.hasImage} />
          <UtilBtn icon={<Dice5 size={16} strokeWidth={2} />} label="randomize" onClick={callbacks.onMosh} disabled={!s.hasImage} />
          <UtilBtn icon={<Trash2 size={16} strokeWidth={2} />} label="clear" onClick={onClear} disabled={!s.hasImage} />
          <div className="w-px h-5 bg-[var(--s-border)] mx-1 self-center" />
          <UtilBtn icon={<MoreHorizontal size={16} strokeWidth={2} />} label="more" active={active === "more"} onClick={() => { setShowEffects(false); toggle("more"); }} />
        </div>

        <div className="grid grid-cols-5 gap-1 px-2 pt-1.5 pb-1">
          <label
            data-tutorial="home-upload"
            className="flex flex-col items-center justify-center gap-1 min-h-[54px] rounded-xl text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] cursor-pointer transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="text-[10px] font-medium leading-none">add</span>
            <input type="file" className="hidden" onChange={callbacks.onImageUpload} accept={imageAccept} />
          </label>
          <div data-tutorial="home-algorithm">
            <PrimaryTab icon={<Layers size={18} strokeWidth={2} />} label="effects" active={showEffects || effectsActive} disabled={!s.hasImage} onClick={() => { close(); setShowEffects(true); }} />
          </div>
          <div data-tutorial="home-adjust">
            <PrimaryTab icon={<SlidersHorizontal size={18} strokeWidth={2} />} label="adjust" active={active === "adjust"} disabled={!s.hasImage} onClick={() => { setShowEffects(false); toggle("adjust"); }} />
          </div>
          <div data-tutorial="home-presets">
            <PrimaryTab icon={<LayoutTemplate size={18} strokeWidth={2} />} label="presets" active={active === "presets"} disabled={!s.hasImage} onClick={() => { setShowEffects(false); toggle("presets"); }} />
          </div>
          <div data-tutorial="home-export">
            <PrimaryTab icon={<Download size={18} strokeWidth={2} />} label="export" active={active === "export"} disabled={!s.hasImage} onClick={() => { setShowEffects(false); toggle("export"); }} />
          </div>
        </div>
      </div>
    </div>
  );
};
