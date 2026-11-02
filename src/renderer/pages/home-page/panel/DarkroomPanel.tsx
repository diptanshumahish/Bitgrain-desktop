import React from "react";
import { Upload, ImageIcon, Trash2, Dices, SunMedium } from "lucide-react";
import {
  LeftPanel,
  PanelSection,
  SliderRow,
  ToggleRow,
  ButtonRow,
  PanelButton,
} from "../../../shell/panel/LeftPanel";
import { useToolbarState } from "../../../components/toolbar/use-toolbar-state";
import { RESOLUTION_MIN, RESOLUTION_MAX } from "../../../store/transform-store";
import { FiltersPopover } from "../../../components/toolbar/popovers/FiltersPopover";
import { PalettePopover } from "../../../components/toolbar/popovers/PalettePopover";
import { AlgorithmPopover } from "../../../components/toolbar/popovers/AlgorithmPopover";
import { HalftonePopover } from "../../../components/toolbar/popovers/halftone/HalftonePopover";
import { PageColourRow } from "../../../components/toolbar/colour/page-colour/PageColourRow";
import { toggleTonePanel } from "../../../modules/grading/editor/tone-panel-events";
import { ArtisticEffectsPopover } from "../../../components/toolbar/popovers/ArtisticEffectsPopover";
import { PopArtPopover } from "../../../components/toolbar/popovers/PopArtPopover";
import { AsciiPopover } from "../../../components/toolbar/popovers/AsciiPopover";
import { BraillePopover } from "../../../components/toolbar/popovers/BraillePopover";
import { ContourPopover } from "../../../components/toolbar/popovers/ContourPopover";
import { InkWashPopover } from "../../../components/toolbar/popovers/InkWashPopover";
import { MangaPopover } from "../../../components/toolbar/popovers/MangaPopover";
import { LUTPopover } from "../../../components/toolbar/popovers/LUTPopover";
import { HazeBloomPopover } from "../../../components/toolbar/popovers/HazeBloomPopover";
import { PresetsPopover } from "../../../components/toolbar/popovers/PresetsPopover";
import type { Preset, PresetConfig } from "../../../components/toolbar/popovers/PresetsPopover";

const noop = (): void => {};

export interface DarkroomPanelProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMosh: () => void;
  onClear: () => void;
  onLoadSample: () => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  transparentBg: boolean;
  onToggleTransparentBg: () => void;
  customPresets: Preset[];
  onSaveCustomPreset: (name: string, config: PresetConfig) => void;
  onDeleteCustomPreset: (name: string) => void;
  imageAccept: string;
}

// The darkroom's control column. Source, Basics and Adjust are bespoke panel
// controls; the deeper effect pickers (palette, filters, dither, halftone,
// artistic, grade, haze, presets) reuse the proven popover bodies in their
// inline `static` mode, so every control keeps its exact behaviour and the
// engine output stays byte-identical. All values flow through useToolbarState.
export function DarkroomPanel(props: DarkroomPanelProps) {
  const s = useToolbarState();
  const graded = !!s.lutId;

  // Which sections are currently contributing to the rendered image. Each drives
  // the red activity dot on its section header so the stack of active effects is
  // visible at a glance.
  const basicsActive = s.isColor;
  const adjustActive =
    s.contrast !== 1 || s.brightness !== 1 || s.saturation !== 1 ||
    s.grain > 0 || s.hue !== 0 || s.printFinish;
  const paletteActive = !!s.palette;
  const ditherActive = s.mode.includes("dither");
  const artisticActive =
    s.isPopartActive || s.isAsciiActive || s.isBrailleActive ||
    s.isContourActive || s.isInkwashActive || s.isMangaActive;

  return (
    <LeftPanel title="Darkroom" subtitle={s.hasImage ? "Editing" : "No image"}>
      <PanelSection title="Source">
        <ButtonRow>
          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[var(--s-border)] px-2 py-1.5 text-[12px] text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)]">
            <Upload size={13} strokeWidth={2} />
            <span>Upload</span>
            <input type="file" className="hidden" accept={props.imageAccept} onChange={props.onImageUpload} />
          </label>
          <PanelButton label="Sample" icon={<ImageIcon size={13} strokeWidth={2} />} onClick={props.onLoadSample} />
        </ButtonRow>
        {s.hasImage && (
          <PanelButton label="Clear image" icon={<Trash2 size={13} strokeWidth={2} />} onClick={props.onClear} tone="danger" />
        )}
      </PanelSection>

      <PanelSection title="Basics" active={basicsActive}>
        <ToggleRow label="colorize" active={s.isColor} onToggle={s.toggleIsColor} disabled={!s.hasImage} />
        <ToggleRow label="compare original" active={props.compareMode} onToggle={props.onToggleCompare} disabled={!s.hasImage} />
        <ToggleRow label="transparent background" active={props.transparentBg} onToggle={props.onToggleTransparentBg} disabled={!s.hasImage} />
        <PanelButton label="Randomize" icon={<Dices size={13} strokeWidth={2} />} onClick={props.onMosh} disabled={!s.hasImage} />
      </PanelSection>

      <PanelSection title="Adjust" active={adjustActive}>
        {/* 200% is the store default and presets reach 250%, so the slider has to span
            that range, otherwise the first drag clamps the image down for good. */}
        <SliderRow label="resolution" value={s.resolution} min={RESOLUTION_MIN} max={RESOLUTION_MAX} step={0.01} onChange={s.setResolution} onDone={s.onDone} format={(v) => `${Math.round(v * 100)}%`} disabled={!s.hasImage || graded} />
        <SliderRow label="contrast" value={s.contrast} min={0} max={2} step={0.01} onChange={s.setContrast} onDone={s.onDone} format={(v) => v.toFixed(2)} disabled={!s.hasImage || graded} />
        <SliderRow label="brightness" value={s.brightness} min={0} max={2} step={0.01} onChange={s.setBrightness} onDone={s.onDone} format={(v) => v.toFixed(2)} disabled={!s.hasImage || graded} />
        <SliderRow label="saturation" value={s.saturation} min={0} max={2} step={0.01} onChange={s.setSaturation} onDone={s.onDone} format={(v) => v.toFixed(2)} disabled={!s.hasImage || graded} />
        <SliderRow label="grain" value={s.grain} min={0} max={1} step={0.01} onChange={s.setGrain} onDone={s.onDone} format={(v) => `${Math.round(v * 100)}%`} disabled={!s.hasImage || graded} />
        <SliderRow label="hue" value={s.hue} min={-180} max={180} step={1} onChange={s.setHue} onDone={s.onDone} format={(v) => `${Math.round(v)}°`} disabled={!s.hasImage || graded} />
        <ToggleRow label="film grain" active={s.isGrainActive} onToggle={s.toggleFilmGrain} disabled={!s.hasImage} />
        <PanelButton label="Tone" icon={<SunMedium size={13} strokeWidth={2} />} onClick={toggleTonePanel} disabled={!s.hasImage} />
        <ToggleRow label="print finish" active={s.printFinish} onToggle={() => { s.setPrintFinish(!s.printFinish); s.onDone(); }} disabled={!s.hasImage} />
        {s.printFinish && (
          <SliderRow label="finish strength" value={s.printFinishStrength} min={0} max={1} step={0.01} onChange={s.setPrintFinishStrength} onDone={s.onDone} format={(v) => `${Math.round(v * 100)}%`} disabled={!s.hasImage} />
        )}
      </PanelSection>

      <PanelSection title="Palette" defaultOpen={false} active={paletteActive}>
        <PageColourRow />
        <PalettePopover palette={s.palette} setPalette={s.setPalette} onClose={noop} static />
      </PanelSection>

      <PanelSection title="Filters" defaultOpen={false} active={s.hasActiveFilters}>
        <FiltersPopover mode={s.mode} setMode={s.setMode} onClose={noop} static />
      </PanelSection>

      <PanelSection title="Dither" defaultOpen={false} active={ditherActive}>
        <ToggleRow label="dither" active={ditherActive} onToggle={s.toggleDither} disabled={!s.hasImage} />
        {/* Picking an algorithm while another texture owns the image switches back
            to dither, matching the toolbar, so the effect that was in the way
            never has to be turned off by hand. */}
        <AlgorithmPopover ditherMethod={s.ditherMethod} setDitherMethod={(m) => { if (!ditherActive) s.selectDither(); s.setDitherMethod(m); }} ditherFactor={s.ditherFactor} setDitherFactor={s.setDitherFactor} onStateChangeFinished={s.onDone} onClose={noop} static />
      </PanelSection>

      <PanelSection title="Halftone" defaultOpen={false} active={s.isHalftoneActive}>
        <HalftonePopover mode={s.mode} onToggle={s.toggleHalftone} onApplyPreset={s.applyPreset} onStateChangeFinished={s.onDone} onClose={noop} static />
      </PanelSection>

      <PanelSection title="Artistic" defaultOpen={false} active={artisticActive}>
        <ArtisticEffectsPopover state={s} onOpen={noop} onClose={noop} static />
        {s.isPopartActive && (
          <PopArtPopover mode={s.mode} onToggle={s.togglePopart} popartCell={s.popartCell} setPopartCell={s.setPopartCell} popartAngle={s.popartAngle} setPopartAngle={s.setPopartAngle} popartThreshold={s.popartThreshold} setPopartThreshold={s.setPopartThreshold} popartGrain={s.popartGrain} setPopartGrain={s.setPopartGrain} popartSpatter={s.popartSpatter} setPopartSpatter={s.setPopartSpatter} popartInk={s.popartInk} setPopartInk={s.setPopartInk} popartPaper={s.popartPaper} setPopartPaper={s.setPopartPaper} onStateChangeFinished={s.onDone} onClose={noop} static />
        )}
        {s.isAsciiActive && (
          <AsciiPopover charset={s.asciiCharset} setCharset={s.setAsciiCharset} tone={s.asciiTone} setTone={s.setAsciiTone} density={s.asciiDensity} setDensity={s.setAsciiDensity} edges={s.asciiEdges} setEdges={s.setAsciiEdges} edgeThreshold={s.asciiEdgeThreshold} setEdgeThreshold={s.setAsciiEdgeThreshold} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={noop} static />
        )}
        {s.isBrailleActive && (
          <BraillePopover density={s.asciiDensity} setDensity={s.setAsciiDensity} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={noop} static />
        )}
        {s.isContourActive && (
          <ContourPopover levels={s.contourLevels} setLevels={s.setContourLevels} fill={s.contourFill} setFill={s.setContourFill} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={noop} static />
        )}
        {s.isInkwashActive && (
          <InkWashPopover mode={s.mode} onToggle={s.toggleInkwash} inkwashDetail={s.inkwashDetail} setInkwashDetail={s.setInkwashDetail} inkwashBands={s.inkwashBands} setInkwashBands={s.setInkwashBands} inkwashBleed={s.inkwashBleed} setInkwashBleed={s.setInkwashBleed} inkwashInk={s.inkwashInk} setInkwashInk={s.setInkwashInk} inkwashPaper={s.inkwashPaper} setInkwashPaper={s.setInkwashPaper} onStateChangeFinished={s.onDone} onClose={noop} static />
        )}
        {s.isMangaActive && (
          <MangaPopover mode={s.mode} onToggle={s.toggleManga} mangaCell={s.mangaCell} setMangaCell={s.setMangaCell} mangaAngle={s.mangaAngle} setMangaAngle={s.setMangaAngle} mangaLineWeight={s.mangaLineWeight} setMangaLineWeight={s.setMangaLineWeight} mangaContrast={s.mangaContrast} setMangaContrast={s.setMangaContrast} onStateChangeFinished={s.onDone} onClose={noop} static />
        )}
      </PanelSection>

      <PanelSection title="Grade (LUT)" defaultOpen={false} active={graded}>
        <LUTPopover activeLutId={s.lutId} onSelectLUT={(id) => s.handleSelectLUT(id)} onClose={noop} static />
      </PanelSection>

      <PanelSection title="Haze & Bloom" defaultOpen={false} active={s.hasActiveHazeBloom}>
        <HazeBloomPopover mode={s.mode} onToggle={s.toggleHazeBloom} hazeIntensity={s.hazeIntensity} setHazeIntensity={s.setHazeIntensity} bloomIntensity={s.bloomIntensity} setBloomIntensity={s.setBloomIntensity} bloomThreshold={s.bloomThreshold} setBloomThreshold={s.setBloomThreshold} hazeWarmth={s.hazeWarmth} setHazeWarmth={s.setHazeWarmth} onStateChangeFinished={s.onDone} onClose={noop} static />
      </PanelSection>

      <PanelSection title="Presets" defaultOpen={false}>
        <PresetsPopover onApplyPreset={s.applyPreset} onClose={noop} currentConfig={s.currentConfig} customPresets={props.customPresets} onSaveCustomPreset={props.onSaveCustomPreset} onDeleteCustomPreset={props.onDeleteCustomPreset} static />
      </PanelSection>
    </LeftPanel>
  );
}
