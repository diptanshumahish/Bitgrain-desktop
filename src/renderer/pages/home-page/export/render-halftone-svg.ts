import { renderForExport } from "../../../components/output-preview/export-render";
import { captureSnapshot, type TransformSnapshot } from "../../../store/transform-store";
import { imageMetaSignal } from "../../../store/image-store";
import { resolveHalftoneCell } from "../../../engine/plugins/halftone/halftone-cell";
import { prefilterForScreen } from "../../../engine/plugins/halftone/halftone-prefilter";
import { normalizeScreenTone } from "../../../engine/plugins/halftone/halftone-tone";
import { paperRgbFor } from "../../../components/output-preview/paper-surface";
import { edgeWidthFor } from "../../../engine/plugins/halftone/halftone-coverage";
import { buildHalftoneScreens, type ScreenSource } from "../../../engine/export/vector/halftone-dots";
import { buildHalftoneSvg } from "../../../engine/export/vector/halftone-svg";
import type { TransformMode } from "../../../engine/types";

const SOURCE_PAPER = "#ffffff";
const SOURCE_INK = "#000000";
const LIGHT_PAPER = "#ffffff";
const DARK_PAPER = "#000000";

const withoutHalftone = (snap: TransformSnapshot): TransformSnapshot => {
  const modes: TransformMode[] = [...snap.modes.slice(0, -1), "original"];
  return { ...snap, modes, palette: null };
};

const readSource = async (snap: TransformSnapshot): Promise<ScreenSource> => {
  const { canvas } = await renderForExport({ fgColor: SOURCE_INK, bgColor: SOURCE_PAPER }, 1, withoutHalftone(snap));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not read the photo for vector export");
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  return { data: Float32Array.from(pixels), width: canvas.width, height: canvas.height };
};

const outputSizeFor = (source: ScreenSource): { width: number; height: number } => {
  const meta = imageMetaSignal.value;
  if (!meta || meta.width <= 0 || meta.height <= 0) return { width: source.width, height: source.height };
  return { width: meta.width, height: meta.height };
};

export const renderHalftoneSvg = async (transparent: boolean): Promise<string> => {
  const snap = captureSnapshot();
  const raw = await readSource(snap);
  const cellPx = resolveHalftoneCell({ ...raw, halftoneLines: snap.halftoneLines, halftoneCell: snap.halftoneCell });
  const filtered = prefilterForScreen(raw.data, raw.width, raw.height, cellPx);
  const source = { ...raw, data: normalizeScreenTone(filtered, raw.width, raw.height) };
  const paper = paperRgbFor(snap.paperColor);
  const screens = buildHalftoneScreens(source, {
    cellPx,
    edgeWidth: edgeWidthFor(snap.halftoneSharpness, cellPx),
    angle: snap.halftoneAngle,
    style: snap.halftoneStyle,
    shape: snap.halftoneShape,
    intensity: snap.halftoneIntensity,
    invert: snap.halftoneInvert,
    paper,
    palette: snap.palette,
  });
  const output = outputSizeFor(raw);
  return buildHalftoneSvg({
    screens,
    width: raw.width,
    height: raw.height,
    cellPx,
    shape: snap.halftoneShape,
    paper: snap.paperColor ?? (snap.halftoneInvert || snap.halftoneStyle === "cmyk" ? LIGHT_PAPER : DARK_PAPER),
    transparent,
    outputWidth: output.width,
    outputHeight: output.height,
  });
};
