import React from "react";
import type { ShapeLayer } from "@bitgrain/studio-core/model/studio-types";
import { readFills, readStrokes } from "@bitgrain/studio-core/shape-render/paint-list/read-paints";
import { shapeFillsPatch, shapeStrokesPatch } from "@bitgrain/studio-core/shape-render/paint-list/write-paints";
import { FillListSection } from "../paint-list/FillListSection";
import { StrokeListSection } from "../paint-list/StrokeListSection";

interface ShapePaintSectionsProps {
  layer: ShapeLayer;
  onChange: (updates: Partial<ShapeLayer>) => void;
}

export const ShapePaintSections: React.FC<ShapePaintSectionsProps> = ({ layer, onChange }) => (
  <>
    <FillListSection
      fills={readFills(layer)}
      box={layer}
      layerId={layer.id}
      pageImage={null}
      onChange={(fills) => onChange(shapeFillsPatch(layer, fills))}
    />
    <StrokeListSection
      strokes={readStrokes(layer)}
      style={layer}
      closed
      defaultCap="butt"
      defaultJoin="miter"
      onChange={(strokes) => onChange(shapeStrokesPatch(layer, strokes))}
      onStyleChange={onChange}
    />
  </>
);
