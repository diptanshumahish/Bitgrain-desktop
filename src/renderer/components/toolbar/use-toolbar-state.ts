import { useSignalValue } from "../../lib/signal";
import {
  modesSignal, ditherMethodSignal, isColorSignal,
  asciiCharsetSignal, asciiToneSignal, asciiDensitySignal,
  asciiEdgesSignal, asciiEdgeThresholdSignal,
  contourLevelsSignal, contourFillSignal, ditherFactorSignal,
  resolutionSignal, contrastSignal, brightnessSignal, saturationSignal,
  grainSignal, hueSignal, printFinishSignal, printFinishStrengthSignal, paletteSignal, lutIdSignal,
  hazeIntensitySignal, bloomIntensitySignal, bloomThresholdSignal, hazeWarmthSignal,
  popartCellSignal, popartAngleSignal, popartThresholdSignal, popartGrainSignal, popartSpatterSignal,
  popartInkSignal, popartPaperSignal,
  inkwashDetailSignal, inkwashBandsSignal, inkwashBleedSignal, inkwashInkSignal, inkwashPaperSignal,
  mangaCellSignal, mangaAngleSignal, mangaLineWeightSignal, mangaContrastSignal,
  applySnapshot, captureSnapshot,
} from "../../store/transform-store";
import type { RGB } from "../../store/transform-store";
import { imageSignal, previewLoadingSignal } from "../../store/image-store";
import { canUndoSignal, canRedoSignal, pushHistory } from "../../store/history-store";
import { trackEvent } from "../../lib/tracker";
import type { TransformMode, DitherMethod, AsciiTone } from "../../engine/types";
import type { PresetConfig } from "./popovers/PresetsPopover";
import { isFilterMode } from "./filter-modes";
import { selectMainEffect } from "./effects/select-main-effect";
import { presetToSnapshot } from "../../engine/presets/preset-snapshot";

const AURA_PALETTE_PREFIX = "aura-";
const AURA_PALETTE_ID = "aura";

export const useToolbarState = () => {
  const mode = useSignalValue(modesSignal);
  const ditherMethod = useSignalValue(ditherMethodSignal);
  const isColor = useSignalValue(isColorSignal);
  const asciiCharset = useSignalValue(asciiCharsetSignal);
  const asciiTone = useSignalValue(asciiToneSignal);
  const asciiDensity = useSignalValue(asciiDensitySignal);
  const asciiEdges = useSignalValue(asciiEdgesSignal);
  const asciiEdgeThreshold = useSignalValue(asciiEdgeThresholdSignal);
  const contourLevels = useSignalValue(contourLevelsSignal);
  const contourFill = useSignalValue(contourFillSignal);
  const ditherFactor = useSignalValue(ditherFactorSignal);
  const resolution = useSignalValue(resolutionSignal);
  const contrast = useSignalValue(contrastSignal);
  const brightness = useSignalValue(brightnessSignal);
  const saturation = useSignalValue(saturationSignal);
  const grain = useSignalValue(grainSignal);
  const hue = useSignalValue(hueSignal);
  const printFinish = useSignalValue(printFinishSignal);
  const printFinishStrength = useSignalValue(printFinishStrengthSignal);
  const palette = useSignalValue(paletteSignal);
  const lutId = useSignalValue(lutIdSignal);
  const hazeIntensity = useSignalValue(hazeIntensitySignal);
  const bloomIntensity = useSignalValue(bloomIntensitySignal);
  const bloomThreshold = useSignalValue(bloomThresholdSignal);
  const hazeWarmth = useSignalValue(hazeWarmthSignal);
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
  const image = useSignalValue(imageSignal);
  const hasImage = !!image;
  const canUndo = useSignalValue(canUndoSignal);
  const canRedo = useSignalValue(canRedoSignal);

  const onDone = () => pushHistory();

  const applyPreset = (config: PresetConfig) => {
    previewLoadingSignal.value = true;
    applySnapshot(presetToSnapshot(captureSnapshot(), config));
    pushHistory();
    trackEvent("home", "preset_applied", { details: { modes: config.modes } });
  };

  const handleSelectLUT = (id: string | null) => {
    lutIdSignal.value = id;
    pushHistory();
    trackEvent("home", "lut_selected", { details: { lut_id: id } });
    if (!id && lutId) trackEvent("home", "lut_cleared", { details: { lut_id: lutId } });
  };

  const currentConfig: PresetConfig = {
    modes: mode, ditherMethod, ditherFactor, palette, resolution,
    contrast, brightness, saturation, grain, hue, isColor,
  };

  const effectsData = {
    modes: mode as unknown as string[],
    lutId,
    ditherMethod: ditherMethod as unknown as string,
    ditherFactor,
    resolution,
    contrast,
    brightness,
    saturation,
    grain,
    hue,
    isColor,
    palette: palette
      ? { id: palette.id, colors: palette.colors.map((c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`) }
      : null,
    hazeIntensity,
    bloomIntensity,
    bloomThreshold,
    hazeWarmth: hazeWarmth as unknown as string,
  };

  const hasActiveFilters = mode.some(isFilterMode);
  const hasActiveHazeBloom = mode.includes("haze-bloom");
  const isDitherActive = mode.includes("dither");
  const isHalftoneActive = mode.includes("halftone");
  const isPopartActive = mode.includes("popart");
  const isAsciiActive = mode.includes("ascii");
  const isBrailleActive = mode.includes("braille");
  const isContourActive = mode.includes("contour");
  const isInkwashActive = mode.includes("inkwash");
  const isMangaActive = mode.includes("manga");
  const isGrainActive = mode.includes("grain");

  const setMode = (m: TransformMode[]) => { modesSignal.value = m; };
  const setHazeIntensity = (v: number) => { hazeIntensitySignal.value = v; };
  const setBloomIntensity = (v: number) => { bloomIntensitySignal.value = v; };
  const setBloomThreshold = (v: number) => { bloomThresholdSignal.value = v; };
  const setHazeWarmth = (v: number) => { hazeWarmthSignal.value = v; };
  const toggleHazeBloom = () => {
    modesSignal.value = hasActiveHazeBloom
      ? mode.filter((m) => m !== "haze-bloom")
      : [...mode, "haze-bloom"];
    onDone();
    trackEvent("home", "haze_bloom_toggled", { details: { enabled: !hasActiveHazeBloom } });
  };
  const setPopartCell = (v: number) => { popartCellSignal.value = v; };
  const setPopartAngle = (v: number) => { popartAngleSignal.value = v; };
  const setPopartThreshold = (v: number) => { popartThresholdSignal.value = v; };
  const setPopartGrain = (v: number) => { popartGrainSignal.value = v; };
  const setPopartSpatter = (v: number) => { popartSpatterSignal.value = v; };
  const setPopartInk = (v: RGB) => { popartInkSignal.value = v; };
  const setPopartPaper = (v: RGB) => { popartPaperSignal.value = v; };
  const toggleHalftone = () => {
    selectMainEffect(isHalftoneActive ? "original" : "halftone");
    onDone();
    trackEvent("home", "halftone_toggled", { details: { enabled: !isHalftoneActive } });
  };
  const togglePopart = () => {
    selectMainEffect(isPopartActive ? "original" : "popart");
    onDone();
    trackEvent("home", "popart_toggled", { details: { enabled: !isPopartActive } });
  };
  const setInkwashDetail = (v: number) => { inkwashDetailSignal.value = v; };
  const setInkwashBands = (v: number) => { inkwashBandsSignal.value = v; };
  const setInkwashBleed = (v: number) => { inkwashBleedSignal.value = v; };
  const setInkwashInk = (v: RGB) => { inkwashInkSignal.value = v; };
  const setInkwashPaper = (v: RGB) => { inkwashPaperSignal.value = v; };
  const toggleInkwash = () => {
    selectMainEffect(isInkwashActive ? "original" : "inkwash");
    onDone();
    trackEvent("home", "inkwash_toggled", { details: { enabled: !isInkwashActive } });
  };
  const setMangaCell = (v: number) => { mangaCellSignal.value = v; };
  const setMangaAngle = (v: number) => { mangaAngleSignal.value = v; };
  const setMangaLineWeight = (v: number) => { mangaLineWeightSignal.value = v; };
  const setMangaContrast = (v: number) => { mangaContrastSignal.value = v; };
  const toggleManga = () => {
    selectMainEffect(isMangaActive ? "original" : "manga");
    onDone();
    trackEvent("home", "manga_toggled", { details: { enabled: !isMangaActive } });
  };
  const toggleAscii = () => {
    selectMainEffect(isAsciiActive ? "original" : "ascii");
    onDone();
    trackEvent("home", "ascii_toggled", { details: { enabled: !isAsciiActive } });
  };
  const toggleBraille = () => {
    selectMainEffect(isBrailleActive ? "original" : "braille");
    onDone();
    trackEvent("home", "braille_toggled", { details: { enabled: !isBrailleActive } });
  };
  const toggleContour = () => {
    selectMainEffect(isContourActive ? "original" : "contour");
    onDone();
    trackEvent("home", "contour_toggled", { details: { enabled: !isContourActive } });
  };
  const toggleFilmGrain = () => {
    const withoutGrain = mode.filter((m) => m !== "grain");
    modesSignal.value = isGrainActive
      ? (withoutGrain.length > 0 ? withoutGrain : ["original"])
      : ["grain", ...mode];
    onDone();
    trackEvent("home", "film_grain_toggled", { details: { enabled: !isGrainActive } });
  };
  const setContourLevels = (v: number) => { contourLevelsSignal.value = v; };
  const setContourFill = (v: boolean) => { contourFillSignal.value = v; };
  const setDitherMethod = (m: DitherMethod) => {
    ditherMethodSignal.value = m;
    trackEvent("home", "dither_method_changed", { details: { method: m } });
  };
  const setDitherFactor = (v: number) => { ditherFactorSignal.value = v; };
  const setResolution = (v: number) => { resolutionSignal.value = v; };
  const setContrast = (v: number) => { contrastSignal.value = v; };
  const setBrightness = (v: number) => { brightnessSignal.value = v; };
  const setSaturation = (v: number) => { saturationSignal.value = v; };
  const setGrain = (v: number) => { grainSignal.value = v; };
  const setHue = (v: number) => { hueSignal.value = v; };
  const setPrintFinish = (v: boolean) => {
    printFinishSignal.value = v;
    trackEvent("home", "print_finish_toggled", { details: { enabled: v } });
  };
  const setPrintFinishStrength = (v: number) => { printFinishStrengthSignal.value = v; };
  const setPalette = (p: typeof palette) => {
    paletteSignal.value = p;
    onDone();
    const paletteId = p?.id.startsWith(AURA_PALETTE_PREFIX) ? AURA_PALETTE_ID : p?.id ?? null;
    trackEvent("home", "palette_selected", { details: { palette_id: paletteId } });
  };
  const toggleIsColor = () => {
    isColorSignal.value = !isColor;
    trackEvent("home", "colorize_toggle", { details: { enabled: !isColor } });
  };
  const selectDither = () => {
    selectMainEffect("dither");
    onDone();
    trackEvent("home", "dither_selected");
  };
  // Dither is the app's base texture: every other effect toggles back to it, so
  // it never had an off state of its own. Turning it off falls through to the
  // engine's one identity pass, the LUT plugin with no LUT selected, which
  // returns the source pixels untouched. Turning it on is exclusive, exactly
  // like the halftone/artistic toggles, so enabling dither no longer means
  // hunting down whichever effect currently owns the image.
  const toggleDither = () => {
    modesSignal.value = isDitherActive ? ["lut"] : ["dither"];
    onDone();
    trackEvent("home", "dither_toggled", { details: { enabled: !isDitherActive } });
  };
  const setAsciiCharset = (v: string) => { asciiCharsetSignal.value = v; };
  const setAsciiTone = (v: AsciiTone) => { asciiToneSignal.value = v; };
  const setAsciiDensity = (v: number) => { asciiDensitySignal.value = v; };
  const setAsciiEdges = (v: boolean) => { asciiEdgesSignal.value = v; };
  const setAsciiEdgeThreshold = (v: number) => { asciiEdgeThresholdSignal.value = v; };

  return {
    mode, ditherMethod, isColor, asciiCharset, asciiTone, asciiDensity,
    asciiEdges, asciiEdgeThreshold,
    ditherFactor, resolution, contrast, brightness, saturation,
    grain, hue, printFinish, printFinishStrength, palette, lutId, hazeIntensity, bloomIntensity, bloomThreshold, hazeWarmth,
    popartCell, popartAngle, popartThreshold, popartGrain, popartSpatter, popartInk, popartPaper,
    inkwashDetail, inkwashBands, inkwashBleed, inkwashInk, inkwashPaper,
    mangaCell, mangaAngle, mangaLineWeight, mangaContrast,
    image, hasImage, canUndo, canRedo,
    onDone, applyPreset, handleSelectLUT, currentConfig, effectsData,
    hasActiveFilters, hasActiveHazeBloom,
    isDitherActive, isHalftoneActive, isPopartActive, isAsciiActive, isBrailleActive, isContourActive,
    isInkwashActive, isMangaActive, isGrainActive, toggleFilmGrain,
    contourLevels, contourFill, setContourLevels, setContourFill,
    setMode, setHazeIntensity, setBloomIntensity, setBloomThreshold, setHazeWarmth, toggleHazeBloom,
    setPopartCell, setPopartAngle, setPopartThreshold, setPopartGrain, setPopartSpatter, setPopartInk, setPopartPaper,
    setInkwashDetail, setInkwashBands, setInkwashBleed, setInkwashInk, setInkwashPaper,
    setMangaCell, setMangaAngle, setMangaLineWeight, setMangaContrast,
    toggleHalftone, togglePopart, toggleAscii, toggleBraille, toggleContour, toggleInkwash, toggleManga,
    setDitherMethod, setDitherFactor, setResolution, setContrast, setBrightness, setSaturation, setGrain, setHue,
    setPrintFinish, setPrintFinishStrength,
    setPalette, toggleIsColor, selectDither, toggleDither,
    setAsciiCharset, setAsciiTone, setAsciiDensity, setAsciiEdges, setAsciiEdgeThreshold,
  };
};

export type ToolbarState = ReturnType<typeof useToolbarState>;
