import React from "react";
import { AlgorithmPopover } from "../popovers/AlgorithmPopover";
import { HalftonePopover } from "../popovers/halftone/HalftonePopover";
import { PopArtPopover } from "../popovers/PopArtPopover";
import { AsciiPopover } from "../popovers/AsciiPopover";
import { BraillePopover } from "../popovers/BraillePopover";
import { ContourPopover } from "../popovers/ContourPopover";
import { InkWashPopover } from "../popovers/InkWashPopover";
import { MangaPopover } from "../popovers/MangaPopover";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover } from "../DesktopToolbar";

interface EffectPanelsProps {
  state: ToolbarState;
  active: ActivePopover;
  close: () => void;
}

export const EffectPanels: React.FC<EffectPanelsProps> = ({ state: s, active, close }) => (
  <>
    {active === "algorithm" && <AlgorithmPopover ditherMethod={s.ditherMethod} setDitherMethod={s.setDitherMethod} ditherFactor={s.ditherFactor} setDitherFactor={s.setDitherFactor} onStateChangeFinished={s.onDone} onClose={close} />}
    {active === "halftone" && <HalftonePopover mode={s.mode} onToggle={s.toggleHalftone} onApplyPreset={s.applyPreset} onStateChangeFinished={s.onDone} onClose={close} />}
    {active === "popart" && <PopArtPopover mode={s.mode} onToggle={s.togglePopart} popartCell={s.popartCell} setPopartCell={s.setPopartCell} popartAngle={s.popartAngle} setPopartAngle={s.setPopartAngle} popartThreshold={s.popartThreshold} setPopartThreshold={s.setPopartThreshold} popartGrain={s.popartGrain} setPopartGrain={s.setPopartGrain} popartSpatter={s.popartSpatter} setPopartSpatter={s.setPopartSpatter} popartInk={s.popartInk} setPopartInk={s.setPopartInk} popartPaper={s.popartPaper} setPopartPaper={s.setPopartPaper} onStateChangeFinished={s.onDone} onClose={close} />}
    {active === "ascii" && <AsciiPopover charset={s.asciiCharset} setCharset={s.setAsciiCharset} tone={s.asciiTone} setTone={s.setAsciiTone} density={s.asciiDensity} setDensity={s.setAsciiDensity} edges={s.asciiEdges} setEdges={s.setAsciiEdges} edgeThreshold={s.asciiEdgeThreshold} setEdgeThreshold={s.setAsciiEdgeThreshold} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} />}
    {active === "braille" && <BraillePopover density={s.asciiDensity} setDensity={s.setAsciiDensity} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} />}
    {active === "contour" && <ContourPopover levels={s.contourLevels} setLevels={s.setContourLevels} fill={s.contourFill} setFill={s.setContourFill} isColor={s.isColor} toggleColor={s.toggleIsColor} onStateChangeFinished={s.onDone} onClose={close} />}
    {active === "inkwash" && <InkWashPopover mode={s.mode} onToggle={s.toggleInkwash} inkwashDetail={s.inkwashDetail} setInkwashDetail={s.setInkwashDetail} inkwashBands={s.inkwashBands} setInkwashBands={s.setInkwashBands} inkwashBleed={s.inkwashBleed} setInkwashBleed={s.setInkwashBleed} inkwashInk={s.inkwashInk} setInkwashInk={s.setInkwashInk} inkwashPaper={s.inkwashPaper} setInkwashPaper={s.setInkwashPaper} onStateChangeFinished={s.onDone} onClose={close} />}
    {active === "manga" && <MangaPopover mode={s.mode} onToggle={s.toggleManga} mangaCell={s.mangaCell} setMangaCell={s.setMangaCell} mangaAngle={s.mangaAngle} setMangaAngle={s.setMangaAngle} mangaLineWeight={s.mangaLineWeight} setMangaLineWeight={s.setMangaLineWeight} mangaContrast={s.mangaContrast} setMangaContrast={s.setMangaContrast} onStateChangeFinished={s.onDone} onClose={close} />}
  </>
);
