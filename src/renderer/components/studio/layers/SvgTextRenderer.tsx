import React from "react";
import type { TextLayer } from "../../../data/studioTypes";

interface SvgTextRendererProps {
  layer: TextLayer;
  responsive?: boolean;
}

const ANCHOR_BY_ALIGN: Record<TextLayer["align"], "start" | "middle" | "end"> = {
  left: "start",
  center: "middle",
  right: "end",
};

const BASELINE_RATIO = 0.82;

const transformText = (
  text: string,
  transform: TextLayer["textTransform"],
): string => {
  if (transform === "uppercase") return text.toUpperCase();
  if (transform === "lowercase") return text.toLowerCase();
  if (transform === "capitalize")
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  return text;
};

export const SvgTextRenderer: React.FC<SvgTextRendererProps> = ({ layer, responsive }) => {
  const rawLines = layer.content.replaceAll("\\n", "\n").split("\n");
  const lines = rawLines.map((line) => transformText(line, layer.textTransform));
  const lineHeightPx = layer.fontSize * layer.lineHeight;
  const baselineFirst = layer.fontSize * BASELINE_RATIO;
  const textAnchor = ANCHOR_BY_ALIGN[layer.align];
  const x =
    layer.align === "left"
      ? 0
      : layer.align === "center"
        ? layer.width / 2
        : layer.width;
  const fontStyle = layer.fontStyle === "italic" ? "italic" : "normal";

  const gradient = layer.gradientText?.enabled ? layer.gradientText : null;
  const gradientId = gradient ? `txtgrad-${layer.id}` : undefined;
  const fill = gradient && gradientId ? `url(#${gradientId})` : layer.color;

  return (
    <svg
      width={responsive ? "100%" : layer.width}
      height={responsive ? "100%" : layer.height}
      viewBox={`0 0 ${layer.width} ${layer.height}`}
      preserveAspectRatio="xMinYMin meet"
      style={{ display: "block", overflow: "visible", pointerEvents: "none" }}
      shapeRendering="geometricPrecision"
    >
      {gradient && gradientId && (
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="objectBoundingBox"
            gradientTransform={`rotate(${gradient.angle - 90} 0.5 0.5)`}
          >
            <stop offset="0%" stopColor={gradient.color1} />
            <stop offset="100%" stopColor={gradient.color2} />
          </linearGradient>
        </defs>
      )}
      {lines.map((line, index) => (
        <text
          key={index}
          x={x}
          y={baselineFirst + index * lineHeightPx}
          fontSize={layer.fontSize}
          fontFamily={layer.fontFamily}
          fontWeight={layer.fontWeight}
          fontStyle={fontStyle}
          fill={fill}
          textAnchor={textAnchor}
          letterSpacing={layer.letterSpacing}
          textDecoration={layer.textDecoration ?? "none"}
        >
          {line || " "}
        </text>
      ))}
    </svg>
  );
};
