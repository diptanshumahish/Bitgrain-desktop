import type {
  Layer,
  TemplateDef,
  TextLayer,
  ShapeLayer,
  ImageLayer,
  UploadLayer,
  GroupLayer,
  VectorLayer,
  InkLayer,
  BezierAnchor,
  OverlayGradient,
} from "../studioTypes";

const round = (value: number): number => Math.round(value * 100) / 100;

const scalePx = (value: number, factor: number): number => round(value * factor);

const scaleAnchor = (anchor: BezierAnchor, factor: number): BezierAnchor => ({
  x: scalePx(anchor.x, factor),
  y: scalePx(anchor.y, factor),
  inHandle: anchor.inHandle
    ? { x: scalePx(anchor.inHandle.x, factor), y: scalePx(anchor.inHandle.y, factor) }
    : undefined,
  outHandle: anchor.outHandle
    ? { x: scalePx(anchor.outHandle.x, factor), y: scalePx(anchor.outHandle.y, factor) }
    : undefined,
});

const scaleOverlay = (overlay: OverlayGradient, factor: number): OverlayGradient => ({
  ...overlay,
  x0: scalePx(overlay.x0, factor),
  y0: scalePx(overlay.y0, factor),
  x1: scalePx(overlay.x1, factor),
  y1: scalePx(overlay.y1, factor),
});

const scaleBaseGeometry = <T extends Layer>(layer: T, factor: number): T => ({
  ...layer,
  x: scalePx(layer.x, factor),
  y: scalePx(layer.y, factor),
  width: scalePx(layer.width, factor),
  height: scalePx(layer.height, factor),
});

const scaleTextLayer = (layer: TextLayer, factor: number): TextLayer => {
  const scaled = scaleBaseGeometry(layer, factor);
  const effects = layer.effects?.map((effect) => {
    if (effect.type === "shadow") {
      return {
        ...effect,
        x: scalePx(effect.x, factor),
        y: scalePx(effect.y, factor),
        blur: scalePx(effect.blur, factor),
      };
    }
    if (effect.type === "outline") {
      return { ...effect, width: scalePx(effect.width, factor) };
    }
    return effect;
  });
  return {
    ...scaled,
    fontSize: scalePx(layer.fontSize, factor),
    letterSpacing: scalePx(layer.letterSpacing, factor),
    ...(effects ? { effects } : {}),
  };
};

const scaleShapeLayer = (layer: ShapeLayer, factor: number): ShapeLayer => ({
  ...scaleBaseGeometry(layer, factor),
  strokeWidth: scalePx(layer.strokeWidth, factor),
  borderRadius: scalePx(layer.borderRadius, factor),
});

const scaleImageLayer = (layer: ImageLayer, factor: number): ImageLayer =>
  scaleBaseGeometry(layer, factor);

const scaleUploadLayer = (layer: UploadLayer, factor: number): UploadLayer => ({
  ...scaleBaseGeometry(layer, factor),
  borderRadius: scalePx(layer.borderRadius, factor),
});

const scaleVectorLayer = (layer: VectorLayer, factor: number): VectorLayer => ({
  ...scaleBaseGeometry(layer, factor),
  strokeWidth: scalePx(layer.strokeWidth, factor),
  path: {
    ...layer.path,
    anchors: layer.path.anchors.map((anchor) => scaleAnchor(anchor, factor)),
    ...(layer.path.extraRings
      ? { extraRings: layer.path.extraRings.map((ring) => ring.map((anchor) => scaleAnchor(anchor, factor))) }
      : {}),
  },
});

const scaleInkLayer = (layer: InkLayer, factor: number): InkLayer =>
  scaleBaseGeometry(layer, factor);

const scaleGroupLayer = (layer: GroupLayer, factor: number): GroupLayer => ({
  ...scaleBaseGeometry(layer, factor),
  gap: scalePx(layer.gap, factor),
  padding: scalePx(layer.padding, factor),
  layers: layer.layers.map((child) => scaleLayer(child, factor)),
});

const scaleLayer = (layer: Layer, factor: number): Layer => {
  switch (layer.type) {
    case "text":
      return scaleTextLayer(layer, factor);
    case "shape":
      return scaleShapeLayer(layer, factor);
    case "image":
      return scaleImageLayer(layer, factor);
    case "upload":
      return scaleUploadLayer(layer, factor);
    case "vector":
      return scaleVectorLayer(layer, factor);
    case "ink":
      return scaleInkLayer(layer, factor);
    case "group":
      return scaleGroupLayer(layer, factor);
    case "frame":
      return {
        ...scaleBaseGeometry(layer, factor),
        layers: layer.layers.map((child) => scaleLayer(child, factor)),
      };
    case "adjustment":
      return scaleBaseGeometry(layer, factor);
  }
};

export const scaleTemplate = (template: TemplateDef, factor: number): TemplateDef => ({
  ...template,
  width: Math.round(template.width * factor),
  height: Math.round(template.height * factor),
  layers: template.layers.map((layer) => scaleLayer(layer, factor)),
  ...(template.overlay ? { overlay: scaleOverlay(template.overlay, factor) } : {}),
});

export const scaleTemplateToMin = (
  template: TemplateDef,
  targetLongestSide: number,
): TemplateDef => {
  const longest = Math.max(template.width, template.height);
  if (longest >= targetLongestSide) return template;
  const factor = targetLongestSide / longest;
  return scaleTemplate(template, factor);
};
