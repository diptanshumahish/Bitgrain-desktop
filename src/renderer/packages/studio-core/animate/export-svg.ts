import type { Layer, TemplateDef, TextLayer, ShapeLayer, ImageLayer, UploadLayer, VectorLayer } from "../model/studio-types";
import type { PageAnimation, TrackGroupId } from "../model/animation-types";
import { animationTotalDurationMs, poseLayersAtTime } from "./tween-layers";
import { createPoseSampler, type PoseSampler } from "./export-timing/pose-sampler";
import { buildLayerChains } from "./export-timing/layer-chains";
import { propertyTiming, ANCESTOR_GEOMETRY_GROUPS } from "./export-timing/property-timing";
import { expandForSvg, svgAnimateElement, type SvgAnimateSpec } from "./export-timing/svg-keyframes";
import { vectorPathToD, dashArrayFor } from "../geometry/vector-utils";
import { laidOutChildren } from "../layout/auto-layout";
import { resolveAssetUrl } from "@bitgrain/api/api-client";

interface BuildSvgArgs {
  template: TemplateDef;
  background: string;
  baseLayers: Layer[];
  animation: PageAnimation;
  width: number;
  height: number;
}

const POSITION_GROUPS: readonly TrackGroupId[] = ["position"];
const OPACITY_GROUPS: readonly TrackGroupId[] = ["opacity"];
const ROTATION_GROUPS: readonly TrackGroupId[] = ["rotation"];
const NO_GROUPS: readonly TrackGroupId[] = [];

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

const flatten = (layers: Layer[], offsetX = 0, offsetY = 0): Layer[] => {
  const out: Layer[] = [];
  for (const layer of layers) {
    if (!layer.visible) continue;
    if (layer.type === "group") {
      out.push(...flatten(laidOutChildren(layer), offsetX + layer.x, offsetY + layer.y));
      continue;
    }
    if (layer.type === "frame") {
      out.push(...flatten(laidOutChildren(layer), offsetX + layer.x, offsetY + layer.y));
      continue;
    }
    out.push({ ...layer, x: layer.x + offsetX, y: layer.y + offsetY });
  }
  return out;
};

interface LayerAnimationContext {
  chain: Layer[];
  animation: PageAnimation;
  sampler: PoseSampler;
  totalMs: number;
}

const sampledLeaf = (context: LayerAnimationContext, timeMs: number): Layer | undefined =>
  context.sampler(timeMs).get(context.chain[context.chain.length - 1].id);

const animateProperty = (
  context: LayerAnimationContext,
  groups: readonly TrackGroupId[],
  ancestorGroups: readonly TrackGroupId[],
  element: SvgAnimateSpec["element"],
  attributes: string,
  format: (leaf: Layer) => string,
): string => {
  const timing = propertyTiming(context.chain, groups, context.animation, ancestorGroups);
  if (timing.timesMs.length < 2) return "";
  const keyframes = expandForSvg(timing);
  const values = keyframes.timesMs.map((timeMs) => {
    const leaf = sampledLeaf(context, timeMs);
    return leaf ? format(leaf) : "";
  });
  return svgAnimateElement({ element, attributes, values, keyframes, totalMs: context.totalMs, loop: context.animation.loop });
};

const rotationOf = (layer: Layer): number => ("rotation" in layer ? (layer as { rotation?: number }).rotation ?? 0 : 0);

const animateTranslate = (context: LayerAnimationContext): string =>
  animateProperty(context, POSITION_GROUPS, ANCESTOR_GEOMETRY_GROUPS, "animateTransform", 'attributeName="transform" type="translate"', (leaf) =>
    `${leaf.x.toFixed(2)},${leaf.y.toFixed(2)}`,
  );

const animateOpacity = (context: LayerAnimationContext): string =>
  animateProperty(context, OPACITY_GROUPS, NO_GROUPS, "animate", 'attributeName="opacity"', (leaf) => leaf.opacity.toFixed(3));

const animateRotation = (context: LayerAnimationContext, base: Layer): string =>
  animateProperty(context, ROTATION_GROUPS, NO_GROUPS, "animateTransform", 'attributeName="transform" type="rotate"', (leaf) =>
    `${rotationOf(leaf).toFixed(2)} ${base.width / 2} ${base.height / 2}`,
  );

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
  const href = layer.src ? escapeXml(resolveAssetUrl(layer.src) ?? layer.src) : "";
  if (!href) return "";
  return `<image href="${href}" x="0" y="0" width="${layer.width}" height="${layer.height}" preserveAspectRatio="${layer.fit === "contain" ? "xMidYMid meet" : "xMidYMid slice"}"/>`;
};

const renderInner = (layer: Layer): string => {
  if (layer.type === "text") return renderText(layer);
  if (layer.type === "shape") return renderShape(layer);
  if (layer.type === "vector") return renderVector(layer);
  if (layer.type === "image" || layer.type === "upload") return renderImage(layer);
  return "";
};

const renderLayer = (layer: Layer, context: LayerAnimationContext): string | null => {
  const inner = renderInner(layer);
  if (!inner) return null;
  const rotation = rotationOf(layer);
  const rotateAnimation = animateRotation(context, layer);
  const rotateGroup =
    rotation || rotateAnimation
      ? `<g transform="rotate(${rotation} ${layer.width / 2} ${layer.height / 2})">${rotateAnimation}${inner}</g>`
      : inner;
  return `<g transform="translate(${layer.x},${layer.y})" opacity="${layer.opacity}">${animateTranslate(context)}${animateOpacity(context)}${rotateGroup}</g>`;
};

export const buildAnimatedSvg = (args: BuildSvgArgs): Blob => {
  const { background, baseLayers, animation, width, height } = args;
  const totalMs = animationTotalDurationMs(animation);
  const sampler = createPoseSampler(baseLayers, animation, flatten);
  const chains = buildLayerChains(baseLayers);
  const body = flatten(poseLayersAtTime(baseLayers, animation, 0))
    .map((layer) => {
      const chain = chains.get(layer.id) ?? [layer];
      return renderLayer(layer, { chain, animation, sampler, totalMs });
    })
    .filter((value): value is string => value !== null)
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${escapeXml(background)}"/>` +
    body +
    `</svg>`;

  return new Blob([svg], { type: "image/svg+xml" });
};
