import React from "react";
import type { ShapeLayer } from "@bitgrain/studio-core/model/studio-types";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { PanelGroup } from "../../ui/panel-group";
import { LineCapFields } from "./LineCapFields";
import { isLineShape, isPolygonShape } from "@bitgrain/studio-core/shapes/shape-kinds";

const PERCENT = 100;
const MIN_STAR_POINTS = 3;
const MAX_STAR_POINTS = 20;
const DEFAULT_STAR_POINTS = 5;
const DEFAULT_STAR_INNER = 0.42;
const MIN_INNER_PERCENT = 1;
const MAX_INNER_PERCENT = 99;
const MIN_SIDES = 3;
const MAX_SIDES = 12;
const PENTAGON_SIDES = 5;
const HEXAGON_SIDES = 6;
const FULL_TURN = 360;

interface ShapeGeometrySectionProps {
  layer: ShapeLayer;
  onChange: (updates: Partial<ShapeLayer>) => void;
}

const percentOf = (ratio: number): number => Math.round(ratio * PERCENT);

export const ShapeGeometrySection: React.FC<ShapeGeometrySectionProps> = ({ layer, onChange }) => {
  const { shapeType } = layer;
  if (shapeType === "star") {
    return (
      <PanelGroup title="Star">
        <div className="grid grid-cols-2 gap-2">
          <ScrubField label="Points" value={layer.starPoints ?? DEFAULT_STAR_POINTS} min={MIN_STAR_POINTS} max={MAX_STAR_POINTS} onChange={(value) => onChange({ starPoints: Math.round(value) })} />
          <ScrubField label="Inner" value={percentOf(layer.starInnerRatio ?? DEFAULT_STAR_INNER)} min={MIN_INNER_PERCENT} max={MAX_INNER_PERCENT} suffix="%" onChange={(value) => onChange({ starInnerRatio: value / PERCENT })} />
        </div>
      </PanelGroup>
    );
  }
  if (isPolygonShape(shapeType)) {
    const fallbackSides = shapeType === "pentagon" ? PENTAGON_SIDES : HEXAGON_SIDES;
    return (
      <PanelGroup title="Polygon">
        <ScrubField label="Sides" value={layer.polygonSides ?? fallbackSides} min={MIN_SIDES} max={MAX_SIDES} onChange={(value) => onChange({ polygonSides: Math.round(value) })} />
      </PanelGroup>
    );
  }
  if (shapeType === "circle") {
    return (
      <PanelGroup title="Arc">
        <div className="grid grid-cols-3 gap-2">
          <ScrubField label="Start" value={layer.arcStart ?? 0} min={-FULL_TURN} max={FULL_TURN} suffix="°" compact onChange={(value) => onChange({ arcStart: value })} />
          <ScrubField label="Sweep" value={layer.arcSweep ?? FULL_TURN} min={0} max={FULL_TURN} suffix="°" compact onChange={(value) => onChange({ arcSweep: value })} />
          <ScrubField label="Ratio" value={percentOf(layer.arcInnerRatio ?? 0)} min={0} max={MAX_INNER_PERCENT} suffix="%" compact onChange={(value) => onChange({ arcInnerRatio: value / PERCENT })} />
        </div>
      </PanelGroup>
    );
  }
  if (isLineShape(shapeType)) {
    return (
      <PanelGroup title="Ends">
        <LineCapFields layer={layer} onChange={onChange} />
      </PanelGroup>
    );
  }
  return null;
};
