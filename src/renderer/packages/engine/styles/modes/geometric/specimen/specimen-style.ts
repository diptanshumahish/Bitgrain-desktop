import type { Frame } from "../../../engine/frame";
import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../engine/style-definition";
import type { ParamValues } from "../../../engine/style-types";
import { seededRandom } from "../../../engine/seeded-random";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { drawSoftCopy, softCopy } from "../../../finish/soft-copy";
import type { FieldGrid } from "../shared/image-fields";
import { colourSpec, numberSpec, option, selectSpec } from "../shared/param-builders";
import { clampRange } from "../shared/scalar-math";
import { fillFrame, sourceCanvas } from "../shared/source-canvas";
import { buildSubjectMask, DEFAULT_MASK_OPTIONS } from "../shared/subject-mask";
import { findCandidates } from "./specimen-candidates";
import { drawSpecimen } from "./specimen-draw";
import { placeBoxes, REGION_COUNT } from "./specimen-placement";

const PERCENT = 100;
const BACKGROUND = "#0e1117";
const MASK_RADIAL = 0.5;
const HUB_THRESHOLD = 150 / 255;
const FONT_SHARE = 0.022;
const FONT_MIN = 7;
const FONT_MAX = 12;
const MIN_BLUR = 0.1;

const paintBackdrop = (frame: Frame, source: SourceImage, blur: number): void => {
  fillFrame(frame, BACKGROUND);
  const canvas = sourceCanvas(source);
  if (blur > MIN_BLUR) drawSoftCopy(frame.context, softCopy(canvas, source.width, source.height, blur), frame.width, frame.height);
  else frame.context.drawImage(canvas, 0, 0);
};

const subjectHub = (mask: FieldGrid, width: number, height: number): [number, number] => {
  let [left, top, right, bottom] = [mask.width, mask.height, -1, -1];
  for (let index = 0; index < mask.data.length; index++) {
    if (mask.data[index] <= HUB_THRESHOLD) continue;
    const [x, y] = [index % mask.width, Math.floor(index / mask.width)];
    [left, top, right, bottom] = [Math.min(left, x), Math.min(top, y), Math.max(right, x), Math.max(bottom, y)];
  }
  if (right < 0) return [width / 2, height / 2];
  return [((left + right + 1) / 2 / mask.width) * width, ((top + bottom + 1) / 2 / mask.height) * height];
};

const regionOrder = (seed: number): number[] => {
  const order = Array.from({ length: REGION_COUNT }, (_, index) => index);
  if (seed === 0) return order;
  const random = seededRandom(seed);
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return order;
};

const fontSizeFor = (params: ParamValues, width: number, height: number, scale: number): number =>
  clampRange((Math.min(width, height) / scale) * FONT_SHARE, FONT_MIN, FONT_MAX) * scale * (numberParam(params, "labelSize") / PERCENT);

const renderSpecimen = (input: FrameRenderInput): void => {
  const { frame, params, scale } = input;
  const source = toneAdjustedSource(input.source, params);
  const mask = buildSubjectMask(source, { ...DEFAULT_MASK_OPTIONS, radial: MASK_RADIAL });
  const seed = numberParam(params, "seed");
  const lineWidth = (numberParam(params, "weight") / PERCENT) * scale;
  const fontSize = fontSizeFor(params, frame.width, frame.height, scale);
  const showLabels = textParam(params, "labels") === "coords";
  const boxes = placeBoxes(findCandidates(source, mask, scale, seed), {
    width: frame.width, height: frame.height, scale, count: numberParam(params, "count"), boxSize: numberParam(params, "boxSize") / PERCENT, lineWidth, fontSize, showLabels,
  }, regionOrder(seed));
  paintBackdrop(frame, source, numberParam(params, "blur"));
  drawSpecimen(frame.context, boxes, subjectHub(mask, frame.width, frame.height), {
    ink: textParam(params, "ink"), scale, lineWidth, radius: numberParam(params, "radius") / PERCENT, fontSize, showLabels, connectors: numberParam(params, "connectors") / PERCENT, width: frame.width,
  });
};

export const SPECIMEN_STYLE: FrameStyleDefinition = {
  id: "specimen",
  label: "Specimen",
  hint: "Lab style boxes, coordinates and links over the photo",
  glyph: "⊞",
  category: "geometric",
  kind: "frame",
  params: [
    colourSpec("ink", "Ink", "#b4dc64"),
    numberSpec({ key: "count", label: "Boxes", min: 1, max: 12, value: 6 }),
    numberSpec({ key: "boxSize", label: "Box size", min: 20, max: 200, value: 133, suffix: "%" }),
    numberSpec({ key: "seed", label: "Layout", min: 0, max: 100, value: 0, advanced: true, hint: "Zero picks the strongest details, other values shuffle" }),
    numberSpec({ key: "weight", label: "Line weight", min: 10, max: 400, step: 5, value: 200, suffix: "%", advanced: true }),
    numberSpec({ key: "radius", label: "Corner radius", min: 0, max: 100, value: 24, suffix: "%", advanced: true }),
    selectSpec("labels", "Labels", [option("coords", "Coordinates"), option("none", "None")], "coords", true),
    numberSpec({ key: "labelSize", label: "Label size", min: 40, max: 250, step: 5, value: 100, suffix: "%", advanced: true }),
    numberSpec({ key: "connectors", label: "Connectors", min: 0, max: 100, value: 35, suffix: "%", advanced: true }),
    numberSpec({ key: "blur", label: "Backdrop blur", min: 0, max: 60, value: 0, suffix: "px", advanced: true, pixels: true }),
    ...frameToneParams(),
  ],
  renderFrame: renderSpecimen,
};
