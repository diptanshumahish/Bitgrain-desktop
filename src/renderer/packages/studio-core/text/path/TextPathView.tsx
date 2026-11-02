import React from "react";
import type { TextLayer } from "../../model/studio-types";
import { textPathD, textPathString } from "./text-path-geometry";
import { textFeatureStyle } from "../layout/text-feature-css";

interface TextPathViewProps {
  layer: TextLayer;
}

const ANCHOR_BY_ALIGN: Record<TextLayer["align"], "start" | "middle" | "end"> = {
  left: "start",
  justify: "start",
  center: "middle",
  right: "end",
};

export const TextPathView: React.FC<TextPathViewProps> = ({ layer }) => {
  if (!layer.textPath) return null;
  const pathId = `text-path-${layer.id}`;
  return (
    <svg
      width={layer.width}
      height={layer.height}
      className="absolute top-0 left-0 overflow-visible pointer-events-none select-none"
    >
      <defs>
        <path id={pathId} d={textPathD(layer.textPath.path, layer.width, layer.height)} />
      </defs>
      <text
        fill={layer.color}
        fontSize={layer.fontSize}
        fontFamily={layer.fontFamily}
        textAnchor={ANCHOR_BY_ALIGN[layer.align]}
        style={{ ...textFeatureStyle(layer), letterSpacing: layer.letterSpacing }}
      >
        <textPath href={`#${pathId}`} startOffset={`${layer.textPath.offset}%`}>
          {textPathString(layer)}
        </textPath>
      </text>
    </svg>
  );
};
