import React from "react";
import type { VectorLayer } from "@bitgrain/studio-core/model/studio-types";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { readFills, readStrokes } from "@bitgrain/studio-core/shape-render/paint-list/read-paints";
import { vectorFillsPatch, vectorStrokesPatch } from "@bitgrain/studio-core/shape-render/paint-list/write-paints";
import { FillListSection } from "../paint-list/FillListSection";
import { StrokeListSection } from "../paint-list/StrokeListSection";

const FULL_PROGRESS = 100;

interface VectorPaintSectionsProps {
  layer: VectorLayer;
  pageImage: string | null;
  onChange: (updates: Partial<VectorLayer>) => void;
}

export const VectorPaintSections: React.FC<VectorPaintSectionsProps> = ({ layer, pageImage, onChange }) => (
  <>
    {layer.path.closed && (
      <FillListSection
        fills={readFills(layer)}
        box={layer}
        layerId={layer.id}
        pageImage={pageImage}
        onChange={(fills) => onChange(vectorFillsPatch(layer, fills))}
      />
    )}
    <StrokeListSection
      strokes={readStrokes(layer)}
      style={layer}
      closed={layer.path.closed}
      defaultCap="round"
      defaultJoin="round"
      onChange={(strokes) => onChange(vectorStrokesPatch(layer, strokes))}
      onStyleChange={onChange}
      trailing={
        <ScrubField
          label="Draw"
          value={Math.round(layer.drawProgress ?? FULL_PROGRESS)}
          min={0}
          max={FULL_PROGRESS}
          suffix="%"
          onChange={(value) => onChange({ drawProgress: value })}
        />
      }
    />
  </>
);
