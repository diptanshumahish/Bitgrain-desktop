import type { Layer, ShapeLayer, VectorLayer } from "@bitgrain/studio-core/model/studio-types";
import { visibleStrokes } from "@bitgrain/studio-core/shape-render/paint-list/read-paints";

type PaintedLayer = ShapeLayer | VectorLayer;

const isPainted = (layer: Layer): layer is PaintedLayer => layer.type === "shape" || layer.type === "vector";

const childrenOf = (layer: Layer): Layer[] =>
  layer.type === "group" || layer.type === "frame" ? layer.layers : [];

export const collectStrokeWidths = (layers: Layer[]): number[] =>
  layers.flatMap((layer) => {
    const own = isPainted(layer) ? visibleStrokes(layer).map((stroke) => stroke.width) : [];
    return [...own, ...collectStrokeWidths(childrenOf(layer))];
  });

const widthPatch = (layer: PaintedLayer, width: number): Partial<PaintedLayer> =>
  layer.strokes ? { strokes: layer.strokes.map((stroke) => ({ ...stroke, width })) } : { strokeWidth: width };

const setNestedWidth = (layers: Layer[], width: number): Layer[] =>
  layers.map((layer): Layer => {
    if (layer.type === "group" || layer.type === "frame") return { ...layer, layers: setNestedWidth(layer.layers, width) };
    if (isPainted(layer) && visibleStrokes(layer).length > 0) return { ...layer, ...widthPatch(layer, width) } as Layer;
    return layer;
  });

export const strokeWidthUpdater =
  (width: number) =>
  (layer: Layer): Partial<Layer> | null => {
    if (isPainted(layer)) return widthPatch(layer, width);
    const children = childrenOf(layer);
    if (collectStrokeWidths(children).length === 0) return null;
    return { layers: setNestedWidth(children, width) } as Partial<Layer>;
  };
