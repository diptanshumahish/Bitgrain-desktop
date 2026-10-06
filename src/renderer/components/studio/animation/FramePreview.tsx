import React from "react";
import type { Layer } from "../../../data/studioTypes";
import { resolveFrameLayers } from "../../../engine/animate/tween-layers";
import { laidOutChildren } from "../../../utils/auto-layout";

interface FramePreviewProps {
  baseLayers: Layer[];
  frameId: string;
  width: number;
  height: number;
  background: string;
}

const flatten = (layers: Layer[], offsetX: number, offsetY: number): Layer[] => {
  const out: Layer[] = [];
  for (const layer of layers) {
    if (layer.visible === false) continue;
    if (layer.type === "group") {
      out.push(...flatten(laidOutChildren(layer), offsetX + layer.x, offsetY + layer.y));
      continue;
    }
    out.push({ ...layer, x: layer.x + offsetX, y: layer.y + offsetY });
  }
  return out;
};

const fillFor = (layer: Layer): string => {
  switch (layer.type) {
    case "shape": return layer.fill || "#888888";
    case "text": return layer.color || "#cccccc";
    case "vector": return layer.fill && layer.fill !== "transparent" ? layer.fill : layer.strokeColor;
    case "image":
    case "upload": return "rgba(255,255,255,0.28)";
    default: return "#888888";
  }
};

export const FramePreview: React.FC<FramePreviewProps> = ({
  baseLayers,
  frameId,
  width,
  height,
  background,
}) => {
  const flat = flatten(resolveFrameLayers(baseLayers, frameId), 0, 0);

  return (
    <svg
      viewBox={`0 0 ${Math.max(1, width)} ${Math.max(1, height)}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full block"
    >
      <rect x={0} y={0} width={width} height={height} fill={background} />
      {flat.map((layer) => {
        const rotation = "rotation" in layer ? (layer as { rotation?: number }).rotation ?? 0 : 0;
        const cx = layer.x + layer.width / 2;
        const cy = layer.y + layer.height / 2;
        return (
          <rect
            key={layer.id}
            x={layer.x}
            y={layer.y}
            width={Math.max(0, layer.width)}
            height={Math.max(0, layer.height)}
            fill={fillFor(layer)}
            opacity={Math.max(0, Math.min(1, layer.opacity))}
            transform={rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined}
          />
        );
      })}
    </svg>
  );
};
