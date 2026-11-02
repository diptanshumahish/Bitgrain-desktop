import React, { useId } from "react";
import type { ShapeLayer } from "@bitgrain/studio-core/model/studio-types";
import { buildShapeRender } from "@bitgrain/studio-core/shape-render/shape-nodes";
import { SvgNodes } from "@bitgrain/studio-core/shape-render/svg-node/svg-node-react";
import { svgSafeId } from "@bitgrain/studio-core/shape-render/svg-id";

interface ShapeSvgContentProps {
  layer: ShapeLayer;
  width: number;
  height: number;
}

export const ShapeSvgContent: React.FC<ShapeSvgContentProps> = ({ layer, width, height }) => {
  const reactId = useId();
  const sized = layer.width === width && layer.height === height ? layer : { ...layer, width, height };
  const render = buildShapeRender(sized, `shp-${svgSafeId(reactId)}`);
  return (
    <>
      {render.defs.length > 0 && (
        <defs>
          <SvgNodes nodes={render.defs} />
        </defs>
      )}
      <SvgNodes nodes={render.body} />
    </>
  );
};
