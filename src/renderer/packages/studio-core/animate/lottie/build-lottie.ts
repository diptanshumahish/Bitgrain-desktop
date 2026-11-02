import type { Layer, VectorLayer, ShapeLayer, TextLayer, ImageLayer, UploadLayer } from "../../model/studio-types";
import type { PageAnimation } from "../../model/animation-types";
import { laidOutChildren } from "../../layout/auto-layout";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { poseLayersAtTime } from "../tween-layers";
import { buildTimeline, toLottieTiming, colorToRgb, type Timeline } from "./keyframes";
import { createPoseSampler } from "../export-timing/pose-sampler";
import { buildLayerChains } from "../export-timing/layer-chains";
import { propertyTiming, ANCESTOR_GEOMETRY_GROUPS } from "../export-timing/property-timing";
import { shapeContent, vectorContent, textDocument, type LottieItem } from "./layer-content";
import {
  animated,
  buildTransform,
  centerPosition,
  leafSampler,
  numProp,
  sizeScale,
  NO_GROUPS,
  PERCENT,
  type LeafContext,
} from "./leaf-props";

interface BuildLottieArgs {
  background: string;
  baseLayers: Layer[];
  animation: PageAnimation;
  width: number;
  height: number;
}

const LOTTIE_VERSION = "5.7.4";
const TEXT_ASCENT = 80;

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

const baseLayerFields = (layer: Layer, type: number, timeline: Timeline, transform: LottieItem): LottieItem => ({
  ddd: 0,
  ty: type,
  nm: layer.name || layer.type,
  sr: 1,
  ks: transform,
  ao: 0,
  ip: 0,
  op: timeline.outPoint,
  st: 0,
  bm: 0,
});

const fontNameFor = (layer: TextLayer): string =>
  `${(layer.fontFamily || "sans-serif").replace(/\s+/g, "")}-${layer.fontWeight}`;

const registerFont = (fonts: LottieItem[], layer: TextLayer): string => {
  const name = fontNameFor(layer);
  if (!fonts.some((font) => font.fName === name)) {
    fonts.push({
      fName: name,
      fFamily: layer.fontFamily || "sans-serif",
      fStyle: layer.fontStyle === "italic" ? "Italic" : "Regular",
      fWeight: layer.fontWeight,
      ascent: TEXT_ASCENT,
    });
  }
  return name;
};

const blobToDataUri = (blob: Blob): Promise<string | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });

const toDataUri = async (src: string): Promise<string | null> => {
  if (src.startsWith("data:")) return src;
  try {
    const response = await fetch(resolveAssetUrl(src) ?? src);
    const blob = await response.blob();
    if (!response.ok || !blob.type.startsWith("image/")) return null;
    return await blobToDataUri(blob);
  } catch {
    return null;
  }
};

const buildImageLayer = async (
  base: ImageLayer | UploadLayer,
  context: LeafContext,
  assetId: string,
): Promise<{ layer: LottieItem; asset: LottieItem } | null> => {
  const src = base.src;
  if (!src) return null;
  const baseWidth = base.width || 1;
  const baseHeight = base.height || 1;
  const dataUri = await toDataUri(src);
  const transform = buildTransform(
    { anchor: [baseWidth / 2, baseHeight / 2], position: centerPosition(context), scale: sizeScale(context) },
    context,
  );
  const asset: LottieItem = dataUri
    ? { id: assetId, w: baseWidth, h: baseHeight, u: "", p: dataUri, e: 1 }
    : { id: assetId, w: baseWidth, h: baseHeight, u: "", p: resolveAssetUrl(src) ?? src, e: 0 };
  return { layer: { ...baseLayerFields(base, 2, context.timeline, transform), refId: assetId }, asset };
};

const vectorShapes = (base: VectorLayer, context: LeafContext): LottieItem[] => {
  const timing = toLottieTiming(propertyTiming(context.chain, ["shape"], context.animation, NO_GROUPS), context.timeline);
  const paths = timing.timesMs.map(
    (timeMs) => ((context.poses(timeMs).get(base.id) ?? base) as VectorLayer).path,
  );
  return vectorContent(base, paths, timing, base.width || 1, base.height || 1);
};

const buildShapeLikeLayer = (base: ShapeLayer | VectorLayer, context: LeafContext): LottieItem => {
  const isVector = base.type === "vector";
  const transform = buildTransform(
    {
      anchor: [0, 0],
      position: centerPosition(context),
      scale: isVector ? sizeScale(context) : { a: 0, k: [PERCENT, PERCENT] },
    },
    context,
  );
  const shapes = isVector ? vectorShapes(base, context) : shapeContent(base, leafSampler(context));
  return { ...baseLayerFields(base, 4, context.timeline, transform), shapes };
};

const buildTextLayer = (base: TextLayer, context: LeafContext, fonts: LottieItem[]): LottieItem => {
  const baseFont = base.fontSize || 1;
  const anchorX = base.align === "center" ? base.width / 2 : base.align === "right" ? base.width : 0;
  const transform = buildTransform(
    {
      anchor: [0, 0],
      position: animated(context, ["position"], ANCESTOR_GEOMETRY_GROUPS, (layer) => [layer.x + anchorX, layer.y + baseFont]),
      scale: animated(context, ["type"], NO_GROUPS, (layer) => {
        const ratio = (numProp(layer, "fontSize", baseFont) / baseFont) * PERCENT;
        return [ratio, ratio];
      }),
    },
    context,
  );
  return { ...baseLayerFields(base, 5, context.timeline, transform), t: textDocument(base, registerFont(fonts, base)) };
};

const rgbToHex = (input: string): string => {
  const [r, g, b] = colorToRgb(input);
  const channel = (value: number): string => Math.round(value * 255).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
};

const backgroundLayer = (background: string, width: number, height: number, timeline: Timeline): LottieItem => ({
  ddd: 0,
  ty: 1,
  nm: "background",
  sr: 1,
  sc: rgbToHex(background),
  sw: width,
  sh: height,
  ks: {
    a: { a: 0, k: [0, 0, 0] },
    p: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 100 },
  },
  ao: 0,
  ip: 0,
  op: timeline.outPoint,
  st: 0,
  bm: 0,
});

export const buildLottie = async (args: BuildLottieArgs): Promise<Blob> => {
  const { background, baseLayers, animation, width, height } = args;
  const timeline = buildTimeline(animation);
  const poses = createPoseSampler(baseLayers, animation, flatten);
  const chains = buildLayerChains(baseLayers);
  const baseLeaves = flatten(poseLayersAtTime(baseLayers, animation, 0));
  const fonts: LottieItem[] = [];
  const assets: LottieItem[] = [];
  const built: LottieItem[] = [];

  for (let index = 0; index < baseLeaves.length; index += 1) {
    const base = baseLeaves[index];
    const context: LeafContext = { chain: chains.get(base.id) ?? [base], base, poses, animation, timeline };
    if (base.type === "shape" || base.type === "vector") {
      built.push(buildShapeLikeLayer(base, context));
    } else if (base.type === "text") {
      built.push(buildTextLayer(base, context, fonts));
    } else if (base.type === "image" || base.type === "upload") {
      const result = await buildImageLayer(base, context, `image_${index}`);
      if (result) {
        assets.push(result.asset);
        built.push(result.layer);
      }
    }
  }

  const layers = built.reverse();
  layers.push(backgroundLayer(background, width, height, timeline));
  layers.forEach((layer, index) => {
    layer.ind = index + 1;
  });

  const document: LottieItem = {
    v: LOTTIE_VERSION,
    fr: timeline.fps,
    ip: 0,
    op: timeline.outPoint,
    w: width,
    h: height,
    nm: "imgi animation",
    ddd: 0,
    assets,
    layers,
  };
  if (fonts.length > 0) document.fonts = { list: fonts };

  return new Blob([JSON.stringify(document)], { type: "application/json" });
};
