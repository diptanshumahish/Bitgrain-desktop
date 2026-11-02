import React from "react";
import type { RichRender } from "@bitgrain/studio-core/shape-render/rich/rich-types";
import { SvgNodes } from "@bitgrain/studio-core/shape-render/svg-node/svg-node-react";
import { layerBlurFilter } from "@bitgrain/studio-core/shape-render/rich/passes/effect-filters";
import { marginRegion } from "@bitgrain/studio-core/shape-render/rich/passes/compose-rich";
import { RichPassView } from "./rich-pass-view";

interface RichPaintSvgProps {
  rich: RichRender;
  renderScale: number;
  opacity?: number;
}

export const RichPaintSvg: React.FC<RichPaintSvgProps> = ({ rich, renderScale, opacity }) => {
  const blurId = `${rich.idBase}-lb`;
  const blurDef = rich.layerBlur > 0 ? [layerBlurFilter(blurId, rich.layerBlur, marginRegion(rich, rich.margin))] : [];
  return (
    <svg
      viewBox={`0 0 ${rich.width} ${rich.height}`}
      preserveAspectRatio="none"
      width={rich.width * renderScale}
      height={rich.height * renderScale}
      shapeRendering="geometricPrecision"
      className="block overflow-visible absolute top-0 left-0 origin-top-left isolate pointer-events-none"
      style={{ transform: `scale(${1 / renderScale})`, opacity }}
    >
      <defs>
        <SvgNodes nodes={[...rich.defs, ...blurDef]} />
      </defs>
      <g filter={rich.layerBlur > 0 ? `url(#${blurId})` : undefined}>
        {rich.passes.map((pass, index) => (
          <RichPassView key={index} pass={pass} box={rich} />
        ))}
      </g>
    </svg>
  );
};
