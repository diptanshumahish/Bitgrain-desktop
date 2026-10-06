import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Dice5, Wand2, LayoutTemplate, Clapperboard,
  Filter, Palette, SlidersHorizontal, Download,
  MoreHorizontal, Aperture, Haze, Brush, PackageOpen,
} from "lucide-react";
import { TabButton } from "./TabButton";
import { GradeLockGroup } from "./GradeLockGroup";
import { Popover } from "./Popover";
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
import { ArtisticEffectsPopover } from "./popovers/ArtisticEffectsPopover";
import { SectionLogo } from "../section-nav/SectionLogo";
import { trackEvent } from "../../lib/tracker";
import { emitModal } from "../../lib/event-bus";
import type { ToolbarState } from "./use-toolbar-state";
import type { Preset, PresetConfig } from "./popovers/PresetsPopover";
import type { DownloadRasterFn } from "../../engine/export/export-types";

export type ActivePopover =
  | "filters" | "palette" | "algorithm" | "adjust"
  | "export" | "presets" | "lut" | "haze-bloom" | "halftone" | "popart" | "ascii" | "braille" | "contour"
  | "inkwash" | "manga" | "artistic" | "more"
  | null;

export interface ToolbarCallbacks {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMosh: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent: boolean) => void;
  onSharePreset: () => void;
  shareState: "idle" | "copied";
  credits: { png: number; svg: number };
  transparentBg: boolean;
  onToggleTransparentBg: () => void;
  customPresets: Preset[];
  onSaveCustomPreset: (name: string, config: PresetConfig) => void;
  onDeleteCustomPreset: (name: string) => void;
}

interface DesktopToolbarProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  callbacks: ToolbarCallbacks;
  imageAccept: string;
}

const Divider = () => (
  <div className="hidden md:block w-px h-5 bg-[var(--s-border)] mx-0.5 self-center shrink-0" />
);

const ARTISTIC_MODES = ["popart", "ascii", "braille", "contour", "inkwash", "manga"];
const ARTISTIC_POPOVERS: ActivePopover[] = ["artistic", "popart", "ascii", "braille", "contour", "inkwash", "manga"];

export const DesktopToolbar: React.FC<DesktopToolbarProps> = ({
  state,
  active,
  toggle,
  close,
  callbacks,
  imageAccept,
}) => {
  const navigate = useNavigate();
  const s = state;
  const artisticOpen = ARTISTIC_POPOVERS.includes(active);
  const anyArtisticActive = s.mode.some((m) => ARTISTIC_MODES.includes(m));

  return (
    <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-50 items-center">
      <div className="relative flex items-center bg-[var(--s-bg-panel)]/90 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 px-2 py-1.5 gap-0.5 font-editorial">
        <SectionLogo
          className="flex items-center mx-1 cursor-pointer group"
          imageClassName="w-7 h-7 rounded object-cover group-hover:scale-105 transition-transform"
        />
        <Divider />
        <label data-tutorial="home-upload" className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-full cursor-pointer text-[var(--s-text-muted)] hover:text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)] transition-all duration-100 min-w-[36px] active:scale-95">
          <Plus size={14} strokeWidth={2.5} />
          <span className="text-[9px] font-medium leading-none">upload</span>
          <input type="file" className="hidden" onChange={callbacks.onImageUpload} accept={imageAccept} />
        </label>
        <Divider />
        <TabButton icon={<Dice5 size={14} strokeWidth={2} />} label="random" onClick={() => { callbacks.onMosh(); trackEvent("home", "mosh_click"); }} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
        <TabButton icon={<Wand2 size={14} strokeWidth={2} />} label="colorize" active={s.isColor} onClick={s.toggleIsColor} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
        <Divider />
        <GradeLockGroup locked={!!s.lutId}>
        <div className="relative" data-tutorial="home-algorithm">
          <TabButton
            icon={
              <span aria-label="dither" className="font-mono text-[8px] leading-none    inline-flex items-center justify-center w-[14px] h-[14px] overflow-hidden select-none" style={{ opacity: s.mode.includes("dither") ? 1 : 0.75 }}>
                {`▒▓░`}
              </span>
            }
            label="dither"
            active={s.mode.includes("dither") || active === "algorithm"}
            onClick={() => { if (!s.mode.includes("dither")) s.selectDither(); toggle("algorithm"); }}
            disabled={!s.hasImage}
            disabledTooltip="Upload an image first"
          />
          <div className="hidden md:block">{active === "algorithm" && <AlgorithmPopover ditherMethod={s.ditherMethod} setDitherMethod={s.setDitherMethod} ditherFactor={s.ditherFactor} setDitherFactor={s.setDitherFactor} onStateChangeFinished={s.onDone} onClose={close} />}</div>
        </div>
        <div className="relative">
          <TabButton
            icon={
              <span aria-label="halftone" className="font-mono text-[7px] leading-none    inline-flex items-center justify-center w-[14px] h-[14px] overflow-hidden select-none" style={{ opacity: s.isHalftoneActive ? 1 : 0.75 }}>
                {`·∶∷▓`}
              </span>
            }
            label="halftone"
            active={active === "halftone" || s.isHalftoneActive}
            onClick={() => toggle("halftone")}
            disabled={!s.hasImage}
            disabledTooltip="Upload an image first"
          />
          <div className="hidden md:block">{active === "halftone" && <HalftonePopover mode={s.mode} onToggle={s.toggleHalftone} halftoneCell={s.halftoneCell} setHalftoneCell={s.setHalftoneCell} halftoneAngle={s.halftoneAngle} setHalftoneAngle={s.setHalftoneAngle} halftoneStyle={s.halftoneStyle} setHalftoneStyle={s.setHalftoneStyle} halftoneShape={s.halftoneShape} setHalftoneShape={s.setHalftoneShape} halftoneInvert={s.halftoneInvert} setHalftoneInvert={s.setHalftoneInvert} halftoneIntensity={s.halftoneIntensity} setHalftoneIntensity={s.setHalftoneIntensity} halftoneSharpness={s.halftoneSharpness} setHalftoneSharpness={s.setHalftoneSharpness} onStateChangeFinished={s.onDone} onClose={close} />}</div>
        </div>
        <div className="relative">
          <TabButton
            icon={<Brush size={14} strokeWidth={2} />}
            label="artistic"
            active={artisticOpen}
            indicator={anyArtisticActive && !artisticOpen}
            onClick={() => toggle("artistic")}
            disabled={!s.hasImage}
            disabledTooltip="Upload an image first"
          />
          <div className="hidden md:block">
            {active === "artistic" && <ArtisticEffectsPopover state={s} onOpen={toggle} onClose={close} />}
            {active === "popart" && <PopArtPopover mode={s.mode} onToggle={s.togglePopart} popartCell={s.popartCell} setPopartCell={s.setPopartCell} popartAngle={s.popartAngle} setPopartAngle={s.setPopartAngle} popartThreshold={s.popartThreshold} setPopartThreshold={s.setPopartThreshold} popartGrain={s.popartGrain} setPopartGrain={s.setPopartGrain} popartSpatter={s.popartSpatter} setPopartSpatter={s.setPopartSpatter} popartInk={s.popartInk} setPopartInk={s.setPopartInk} popartPaper={s.popartPaper} setPopartPaper={s.setPopartPaper} onStateChangeFinished={s.onDone} onClose={close} />}
            {active === "ascii" && <AsciiPopover charset={s.asciiCharset} setCharset={s.setAsciiCharset} tone={s.asciiTone} setTone={s.setAsciiTone} density={s.asciiDensity} setDensity={s.setAsciiDensity} edges={s.asciiEdges} setEdges={s.setAsciiEdges} edgeThreshold={s.asciiEdgeThreshold} setEdgeThreshold={s.setAsciiEdgeThreshold} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} />}
            {active === "braille" && <BraillePopover density={s.asciiDensity} setDensity={s.setAsciiDensity} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} />}
            {active === "contour" && <ContourPopover levels={s.contourLevels} setLevels={s.setContourLevels} fill={s.contourFill} setFill={s.setContourFill} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} />}
            {active === "inkwash" && <InkWashPopover mode={s.mode} onToggle={s.toggleInkwash} inkwashDetail={s.inkwashDetail} setInkwashDetail={s.setInkwashDetail} inkwashBands={s.inkwashBands} setInkwashBands={s.setInkwashBands} inkwashBleed={s.inkwashBleed} setInkwashBleed={s.setInkwashBleed} inkwashInk={s.inkwashInk} setInkwashInk={s.setInkwashInk} inkwashPaper={s.inkwashPaper} setInkwashPaper={s.setInkwashPaper} onStateChangeFinished={s.onDone} onClose={close} />}
            {active === "manga" && <MangaPopover mode={s.mode} onToggle={s.toggleManga} mangaCell={s.mangaCell} setMangaCell={s.setMangaCell} mangaAngle={s.mangaAngle} setMangaAngle={s.setMangaAngle} mangaLineWeight={s.mangaLineWeight} setMangaLineWeight={s.setMangaLineWeight} mangaContrast={s.mangaContrast} setMangaContrast={s.setMangaContrast} onStateChangeFinished={s.onDone} onClose={close} />}
          </div>
        </div>
        </GradeLockGroup>
        <div className="relative" data-tutorial="home-presets">
          <TabButton icon={<LayoutTemplate size={14} strokeWidth={2} />} label="presets" active={active === "presets"} onClick={() => toggle("presets")} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
          <div className="hidden md:block">{active === "presets" && <PresetsPopover onApplyPreset={s.applyPreset} onClose={close} currentConfig={s.currentConfig} customPresets={callbacks.customPresets} onSaveCustomPreset={callbacks.onSaveCustomPreset} onDeleteCustomPreset={callbacks.onDeleteCustomPreset} />}</div>
        </div>
        <div className="relative">
          <TabButton icon={<Clapperboard size={14} strokeWidth={2} />} label="grade" active={active === "lut" || !!s.lutId} onClick={() => toggle("lut")} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
          <div className="hidden md:block">{active === "lut" && <LUTPopover activeLutId={s.lutId} onSelectLUT={(id) => { s.handleSelectLUT(id); if (id) close(); }} onClose={close} />}</div>
        </div>
        <div className="relative">
          <TabButton icon={<Haze size={14} strokeWidth={2} />} label="haze" active={active === "haze-bloom" || s.hasActiveHazeBloom} onClick={() => toggle("haze-bloom")} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
          <div className="hidden md:block">{active === "haze-bloom" && <HazeBloomPopover mode={s.mode} onToggle={s.toggleHazeBloom} hazeIntensity={s.hazeIntensity} setHazeIntensity={s.setHazeIntensity} bloomIntensity={s.bloomIntensity} setBloomIntensity={s.setBloomIntensity} bloomThreshold={s.bloomThreshold} setBloomThreshold={s.setBloomThreshold} hazeWarmth={s.hazeWarmth} setHazeWarmth={s.setHazeWarmth} onStateChangeFinished={s.onDone} onClose={close} />}</div>
        </div>
        <Divider />
        <GradeLockGroup locked={!!s.lutId}>
          <div className="relative">
            <TabButton icon={<Filter size={14} strokeWidth={2} />} label="filters" active={active === "filters" || s.hasActiveFilters} onClick={() => toggle("filters")} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
            <div className="hidden md:block">{active === "filters" && <FiltersPopover mode={s.mode} setMode={s.setMode} onClose={close} />}</div>
          </div>
        </GradeLockGroup>
        <Divider />
        <GradeLockGroup locked={!!s.lutId}>
          <div className="relative">
            <TabButton icon={<Palette size={14} strokeWidth={2} />} label="palette" active={active === "palette" || !!s.palette} onClick={() => toggle("palette")} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
            <div className="hidden md:block">{active === "palette" && <PalettePopover palette={s.palette} setPalette={s.setPalette} onClose={close} />}</div>
          </div>
          <div className="relative" data-tutorial="home-adjust">
            <TabButton icon={<SlidersHorizontal size={14} strokeWidth={2} />} label="adjust" active={active === "adjust"} onClick={() => toggle("adjust")} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
            <div className="hidden md:block">{active === "adjust" && <AdjustPopover resolution={s.resolution} setResolution={s.setResolution} contrast={s.contrast} setContrast={s.setContrast} brightness={s.brightness} setBrightness={s.setBrightness} saturation={s.saturation} setSaturation={s.setSaturation} grain={s.grain} setGrain={s.setGrain} hue={s.hue} setHue={s.setHue} printFinish={s.printFinish} setPrintFinish={s.setPrintFinish} printFinishStrength={s.printFinishStrength} setPrintFinishStrength={s.setPrintFinishStrength} mode={s.mode} filmGrain={s.isGrainActive} onToggleFilmGrain={s.toggleFilmGrain} onStateChangeFinished={s.onDone} onClose={close} />}</div>
          </div>
        </GradeLockGroup>
        <Divider />
        <div className="relative" data-tutorial="home-export">
          <TabButton icon={<Download size={14} strokeWidth={2} />} label="export" active={active === "export"} onClick={() => toggle("export")} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
          <div className="hidden md:block">
            {active === "export" && (
              <Popover onClose={close} className="right-0">
                <ExportPopover credits={callbacks.credits} transparentBg={callbacks.transparentBg} onToggleTransparentBg={callbacks.onToggleTransparentBg} onDownloadRaster={callbacks.onDownloadRaster} onDownloadSvg={callbacks.onDownloadSvg} onSharePreset={callbacks.onSharePreset} shareState={callbacks.shareState} isLUT={!!s.lutId} imageData={s.image ?? undefined} effectsData={s.effectsData} onClose={close} />
              </Popover>
            )}
          </div>
        </div>
        <TabButton icon={<PackageOpen size={14} strokeWidth={2} />} label="batch" onClick={() => { emitModal({ type: "batch" }); trackEvent("home", "batch_modal_open"); }} disabled={!s.hasImage} disabledTooltip="Upload an image first" beta={true} />
        <Divider />
        <TabButton icon={<Aperture size={14} strokeWidth={2} />} label="studio" onClick={() => { trackEvent("home", "nav_to_studio"); navigate("/studio"); }} isNew={true} />
        <Divider />
        <div className="relative">
          <TabButton icon={<MoreHorizontal size={14} strokeWidth={2} />} label="more" active={active === "more"} onClick={() => toggle("more")} />
          <div className="hidden md:block">
            {active === "more" && (
              <Popover onClose={close} className="right-0">
                <MorePopover onClose={close} />
              </Popover>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
