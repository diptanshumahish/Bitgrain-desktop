import { rulerTicks } from "./ruler-ticks";

type RulerOrientation = "top" | "left";

export interface RulerColors {
  background: string;
  tick: string;
  text: string;
  highlight: string;
}

export interface RulerHighlight {
  start: number;
  end: number;
}

interface RulerPaintInput {
  orientation: RulerOrientation;
  origin: number;
  zoom: number;
  length: number;
  thickness: number;
  highlight: RulerHighlight | null;
  colors: RulerColors;
}

const MAJOR_TICK_RATIO = 0.55;
const MINOR_TICK_RATIO = 0.25;
const LABEL_FONT = "9px ui-sans-serif, system-ui, sans-serif";
const LABEL_OFFSET_PX = 3;
const LABEL_BASELINE_PX = 9;
const HALF_PIXEL = 0.5;
const QUARTER_TURN = -Math.PI / 2;
const HIGHLIGHT_ALPHA = 0.22;

const prepareCanvas = (canvas: HTMLCanvasElement, input: RulerPaintInput): CanvasRenderingContext2D | null => {
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = input.orientation === "top" ? input.length : input.thickness;
  const cssHeight = input.orientation === "top" ? input.thickness : input.length;
  canvas.width = Math.max(1, Math.round(cssWidth * ratio));
  canvas.height = Math.max(1, Math.round(cssHeight * ratio));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.fillStyle = input.colors.background;
  context.fillRect(0, 0, cssWidth, cssHeight);
  return context;
};

const paintHighlight = (context: CanvasRenderingContext2D, input: RulerPaintInput): void => {
  if (!input.highlight) return;
  context.save();
  context.globalAlpha = HIGHLIGHT_ALPHA;
  context.fillStyle = input.colors.highlight;
  const size = input.highlight.end - input.highlight.start;
  if (input.orientation === "top") context.fillRect(input.highlight.start, 0, size, input.thickness);
  else context.fillRect(0, input.highlight.start, input.thickness, size);
  context.restore();
};

const paintLabel = (context: CanvasRenderingContext2D, input: RulerPaintInput, screen: number, label: string): void => {
  if (input.orientation === "top") {
    context.fillText(label, screen + LABEL_OFFSET_PX, LABEL_BASELINE_PX);
    return;
  }
  context.save();
  context.translate(LABEL_BASELINE_PX, screen - LABEL_OFFSET_PX);
  context.rotate(QUARTER_TURN);
  context.fillText(label, 0, 0);
  context.restore();
};

const paintTicks = (context: CanvasRenderingContext2D, input: RulerPaintInput): void => {
  context.strokeStyle = input.colors.tick;
  context.fillStyle = input.colors.text;
  context.font = LABEL_FONT;
  context.lineWidth = 1;
  context.beginPath();
  for (const tick of rulerTicks({ origin: input.origin, zoom: input.zoom, length: input.length })) {
    const depth = input.thickness * (tick.major ? MAJOR_TICK_RATIO : MINOR_TICK_RATIO);
    const position = Math.round(tick.screen) + HALF_PIXEL;
    if (input.orientation === "top") {
      context.moveTo(position, input.thickness);
      context.lineTo(position, input.thickness - depth);
    } else {
      context.moveTo(input.thickness, position);
      context.lineTo(input.thickness - depth, position);
    }
    if (tick.major) paintLabel(context, input, tick.screen, String(tick.value));
  }
  context.stroke();
};

const paintEdge = (context: CanvasRenderingContext2D, input: RulerPaintInput): void => {
  context.strokeStyle = input.colors.tick;
  context.beginPath();
  const edge = input.thickness - HALF_PIXEL;
  if (input.orientation === "top") {
    context.moveTo(0, edge);
    context.lineTo(input.length, edge);
  } else {
    context.moveTo(edge, 0);
    context.lineTo(edge, input.length);
  }
  context.stroke();
};

export const paintRuler = (canvas: HTMLCanvasElement, input: RulerPaintInput): void => {
  const context = prepareCanvas(canvas, input);
  if (!context) return;
  paintHighlight(context, input);
  paintTicks(context, input);
  paintEdge(context, input);
};
