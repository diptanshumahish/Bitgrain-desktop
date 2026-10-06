import type { Layer, TemplateDef, TextLayer, ShapeLayer, ImageLayer, UploadLayer, VectorLayer } from "../../data/studioTypes";
import type { NumericProp, PageAnimation } from "../../data/animation-types";
import { frameStartTimes, animationTotalDurationMs } from "./tween-layers";
import { vectorPathToD, dashArrayFor } from "../../utils/vector-utils";
import { laidOutChildren } from "../../utils/auto-layout";

export interface BuildSvgArgs {
  template: TemplateDef;
  background: string;
  baseLayers: Layer[];
  animation: PageAnimation;
  width: number;
  height: number;
}

const escapeXml = (value: string): string =>
  value.replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      default: return "&apos;";
    }
  });

const valueAt = (layer: Layer, frameId: string, prop: NumericProp, fallback: number): number => {
  const value = layer.anim?.[frameId]?.[prop];
  return typeof value === "number" ? value : fallback;
};

const flatten = (layers: Layer[], offsetX = 0, offsetY = 0): Layer[] => {
  const out: Layer[] = [];
  for (const layer of layers) {
    if (!layer.visible) continue;
    if (layer.type === "group") {
      out.push(...flatten(laidOutChildren(layer), offsetX + layer.x, offsetY + layer.y));
      continue;
    }
    if (layer.type === "frame") {
      out.push(...flatten(layer.layers, offsetX + layer.x, offsetY + layer.y));
      continue;
    }
    out.push({ ...layer, x: layer.x + offsetX, y: layer.y + offsetY });
  }
  return out;
};

const buildKeyTimes = (animation: PageAnimation): string => {
  const starts = frameStartTimes(animation);
  const total = animationTotalDurationMs(animation);
  if (total <= 0) return "0;1";
  const times = starts.map((start) => (start / total).toFixed(4));
  if (animation.loop) times.push("1");
  return times.join(";");
};

const collectStates = (
  layer: Layer,
  animation: PageAnimation,
  prop: NumericProp,
  base: number,
): number[] => {
  const states = animation.frames.map((frame) => valueAt(layer, frame.id, prop, base));
  if (animation.loop) states.push(states[0]);
  return states;
};

const animateTransformTranslate = (layer: Layer, animation: PageAnimation, keyTimes: string, dur: string): string => {
  const xs = collectStates(layer, animation, "x", layer.x);
  const ys = collectStates(layer, animation, "y", layer.y);
  const values = xs.map((x, index) => `${x.toFixed(2)},${ys[index].toFixed(2)}`).join(";");
  return `<animateTransform attributeName="transform" type="translate" values="${values}" keyTimes="${keyTimes}" dur="${dur}" repeatCount="${animation.loop ? "indefinite" : "1"}" fill="freeze"/>`;
};

const animateOpacity = (layer: Layer, animation: PageAnimation, keyTimes: string, dur: string): string => {
  const values = collectStates(layer, animation, "opacity", layer.opacity)
    .map((value) => value.toFixed(3))
    .join(";");
  return `<animate attributeName="opacity" values="${values}" keyTimes="${keyTimes}" dur="${dur}" repeatCount="${animation.loop ? "indefinite" : "1"}" fill="freeze"/>`;
};

const renderShape = (layer: ShapeLayer): string => {
  const fill = escapeXml(layer.fill || "#000000");
  if (layer.shapeType === "circle") {
    return `<ellipse cx="${layer.width / 2}" cy="${layer.height / 2}" rx="${layer.width / 2}" ry="${layer.height / 2}" fill="${fill}"/>`;
  }
  const radius = layer.borderRadius || 0;
  return `<rect x="0" y="0" width="${layer.width}" height="${layer.height}" rx="${radius}" fill="${fill}"/>`;
};

const renderText = (layer: TextLayer): string => {
  const fill = escapeXml(layer.color || "#000000");
  const family = escapeXml(layer.fontFamily || "sans-serif");
  const anchor = layer.align === "center" ? "middle" : layer.align === "right" ? "end" : "start";
  const anchorX = layer.align === "center" ? layer.width / 2 : layer.align === "right" ? layer.width : 0;
  const lines = (layer.content || "").split("\n");
  const lineHeight = layer.fontSize * (layer.lineHeight || 1.2);
  const spans = lines
    .map((line, index) => `<tspan x="${anchorX}" dy="${index === 0 ? layer.fontSize : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
  return `<text font-family="${family}" font-size="${layer.fontSize}" font-weight="${layer.fontWeight}" fill="${fill}" text-anchor="${anchor}">${spans}</text>`;
};

const renderVector = (layer: VectorLayer): string => {
  const closed = layer.path.closed;
  const fill = closed ? escapeXml(layer.fill || "none") : "none";
  const stroke = escapeXml(layer.strokeColor || "#000000");
  const dashArray = dashArrayFor(layer.dashStyle, layer.strokeWidth);
  const dashAttr = dashArray ? ` stroke-dasharray="${dashArray}"` : "";
  const path = `<path d="${vectorPathToD(layer.path)}" fill="${fill}" stroke="${stroke}" stroke-width="${layer.strokeWidth}" stroke-linecap="${layer.lineCap}" stroke-linejoin="${layer.lineJoin}"${dashAttr} vector-effect="non-scaling-stroke"/>`;
  return `<svg x="0" y="0" width="${layer.width}" height="${layer.height}" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">${path}</svg>`;
};

const renderImage = (layer: ImageLayer | UploadLayer): string => {
  const href = layer.src ? escapeXml(layer.src) : "";
  if (!href) return "";
  return `<image href="${href}" x="0" y="0" width="${layer.width}" height="${layer.height}" preserveAspectRatio="${layer.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"}"/>`;
};

const renderLayer = (layer: Layer, animation: PageAnimation, keyTimes: string, dur: string): string | null => {
  let inner = "";
  if (layer.type === "text") inner = renderText(layer);
  else if (layer.type === "shape") inner = renderShape(layer);
  else if (layer.type === "vector") inner = renderVector(layer);
  else if (layer.type === "image" || layer.type === "upload") inner = renderImage(layer);
  else return null;
  if (!inner) return null;

  const rotation = "rotation" in layer ? (layer as { rotation?: number }).rotation ?? 0 : 0;
  const rotateGroup = rotation
    ? `<g transform="rotate(${rotation} ${layer.width / 2} ${layer.height / 2})">${inner}</g>`
    : inner;

  return `<g transform="translate(${layer.x},${layer.y})">${animateTransformTranslate(layer, animation, keyTimes, dur)}${animateOpacity(layer, animation, keyTimes, dur)}${rotateGroup}</g>`;
};

export const buildAnimatedSvg = (args: BuildSvgArgs): Blob => {
  const { background, baseLayers, animation, width, height } = args;
  const totalSeconds = (animationTotalDurationMs(animation) / 1000).toFixed(3);
  const dur = `${totalSeconds}s`;
  const keyTimes = buildKeyTimes(animation);

  const layers = flatten(baseLayers);
  const body = layers
    .map((layer) => renderLayer(layer, animation, keyTimes, dur))
    .filter((value): value is string => value !== null)
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${escapeXml(background)}"/>` +
    body +
    `</svg>`;

  return new Blob([svg], { type: "image/svg+xml" });
};
