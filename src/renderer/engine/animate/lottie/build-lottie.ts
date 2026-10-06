import type { Layer, VectorLayer, ShapeLayer, TextLayer, ImageLayer, UploadLayer } from "../../../data/studioTypes";
import type { PageAnimation } from "../../../data/animation-types";
import { laidOutChildren } from "../../../utils/auto-layout";
import { resolveFrameLayers } from "../tween-layers";
import { buildTimeline, keyframed, scalarKeyframed, colorToRgb, type Timeline, type LottieProp } from "./keyframes";
import { shapeContent, vectorContent, textDocument, type Sampler, type LottieItem } from "./layer-content";

export interface BuildLottieArgs {
  background: string;
  baseLayers: Layer[];
  animation: PageAnimation;
  width: number;
  height: number;
}

const LOTTIE_VERSION = "5.7.4";
const TEXT_ASCENT = 80;

const asRecord = (layer: Layer): Record<string, unknown> => layer as unknown as Record<string, unknown>;

const numProp = (layer: Layer, prop: string, fallback: number): number => {
  const value = asRecord(layer)[prop];
  return typeof value === "number" ? value : fallback;
};

const strProp = (layer: Layer, prop: string, fallback: string): string => {
  const value = asRecord(layer)[prop];
  return typeof value === "string" ? value : fallback;
};

const rotationOf = (layer: Layer): number => numProp(layer, "rotation", 0);

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

const framePoses = (baseLayers: Layer[], animation: PageAnimation): Layer[][] => {
  const ids = animation.frames.map((frame) => frame.id);
  if (animation.loop && ids.length > 1) ids.push(animation.frames[0].id);
  return ids.map((frameId) => flatten(resolveFrameLayers(baseLayers, frameId)));
};

const seriesFor = (poses: Layer[][], base: Layer): Layer[] =>
  poses.map((leaves) => leaves.find((leaf) => leaf.id === base.id) ?? base);

const seriesSampler = (series: Layer[], timeline: Timeline): Sampler => ({
  numeric: (prop, fallback) => scalarKeyframed(series.map((layer) => numProp(layer, prop, fallback)), timeline),
  tuple: ([propA, propB], [baseA, baseB]) =>
    keyframed(series.map((layer) => [numProp(layer, propA, baseA), numProp(layer, propB, baseB)]), timeline),
  color: (prop, fallback) =>
    keyframed(series.map((layer) => colorToRgb(strProp(layer, prop, fallback))), timeline),
});

interface TransformInput {
  anchor: [number, number];
  positions: number[][];
  scale: LottieProp;
  rotations: number[];
  opacities: number[];
}

const buildTransform = (input: TransformInput, timeline: Timeline): LottieItem => ({
  a: { a: 0, k: [input.anchor[0], input.anchor[1], 0] },
  p: keyframed(input.positions, timeline),
  s: input.scale,
  r: scalarKeyframed(input.rotations, timeline),
  o: scalarKeyframed(input.opacities, timeline),
});

const centerPositions = (series: Layer[]): number[][] =>
  series.map((layer) => [layer.x + layer.width / 2, layer.y + layer.height / 2]);

const rotations = (series: Layer[]): number[] => series.map((layer) => rotationOf(layer));

const opacities = (series: Layer[]): number[] => series.map((layer) => layer.opacity * 100);

const sizeScale = (series: Layer[], base: Layer, timeline: Timeline): LottieProp => {
  const baseWidth = base.width || 1;
  const baseHeight = base.height || 1;
  return keyframed(series.map((layer) => [(layer.width / baseWidth) * 100, (layer.height / baseHeight) * 100]), timeline);
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
    const response = await fetch(src);
    return await blobToDataUri(await response.blob());
  } catch {
    return null;
  }
};

const buildImageLayer = async (
  base: ImageLayer | UploadLayer,
  series: Layer[],
  timeline: Timeline,
  assetId: string,
): Promise<{ layer: LottieItem; asset: LottieItem } | null> => {
  const src = base.src;
  if (!src) return null;
  const baseWidth = base.width || 1;
  const baseHeight = base.height || 1;
  const dataUri = await toDataUri(src);

  const transform = buildTransform(
    {
      anchor: [baseWidth / 2, baseHeight / 2],
      positions: centerPositions(series),
      scale: sizeScale(series, base, timeline),
      rotations: rotations(series),
      opacities: opacities(series),
    },
    timeline,
  );

  const asset: LottieItem = dataUri
    ? { id: assetId, w: baseWidth, h: baseHeight, u: "", p: dataUri, e: 1 }
    : { id: assetId, w: baseWidth, h: baseHeight, u: "", p: src, e: 0 };

  return { layer: { ...baseLayerFields(base, 2, timeline, transform), refId: assetId }, asset };
};

const buildShapeLikeLayer = (base: ShapeLayer | VectorLayer, series: Layer[], timeline: Timeline): LottieItem => {
  const isVector = base.type === "vector";
  const transform = buildTransform(
    {
      anchor: [0, 0],
      positions: centerPositions(series),
      scale: isVector ? sizeScale(series, base, timeline) : { a: 0, k: [100, 100] },
      rotations: rotations(series),
      opacities: opacities(series),
    },
    timeline,
  );
  const shapes = isVector
    ? vectorContent(
        base as VectorLayer,
        series.map((layer) => (layer as VectorLayer).path),
        timeline,
        base.width || 1,
        base.height || 1,
      )
    : shapeContent(base as ShapeLayer, seriesSampler(series, timeline));
  return { ...baseLayerFields(base, 4, timeline, transform), shapes };
};

const buildTextLayer = (base: TextLayer, series: Layer[], timeline: Timeline, fonts: LottieItem[]): LottieItem => {
  const baseFont = base.fontSize || 1;
  const anchorX = base.align === "center" ? base.width / 2 : base.align === "right" ? base.width : 0;
  const transform = buildTransform(
    {
      anchor: [0, 0],
      positions: series.map((layer) => [layer.x + anchorX, layer.y + baseFont]),
      scale: keyframed(
        series.map((layer) => {
          const ratio = (numProp(layer, "fontSize", baseFont) / baseFont) * 100;
          return [ratio, ratio];
        }),
        timeline,
      ),
      rotations: rotations(series),
      opacities: opacities(series),
    },
    timeline,
  );
  return { ...baseLayerFields(base, 5, timeline, transform), t: textDocument(base, registerFont(fonts, base)) };
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
  const poses = framePoses(baseLayers, animation);
  const baseLeaves = poses[0] ?? [];
  const fonts: LottieItem[] = [];
  const assets: LottieItem[] = [];
  const built: LottieItem[] = [];

  for (let index = 0; index < baseLeaves.length; index += 1) {
    const base = baseLeaves[index];
    const series = seriesFor(poses, base);
    if (base.type === "shape" || base.type === "vector") {
      built.push(buildShapeLikeLayer(base, series, timeline));
    } else if (base.type === "text") {
      built.push(buildTextLayer(base, series, timeline, fonts));
    } else if (base.type === "image" || base.type === "upload") {
      const result = await buildImageLayer(base, series, timeline, `image_${index}`);
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
