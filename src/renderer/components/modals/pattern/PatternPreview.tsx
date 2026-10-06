import React from "react";
import type { ShapeLayer } from "../../../data/studioTypes";

interface PatternPreviewProps {
  layers: ShapeLayer[];
  size: number;
}

const PREVIEW_PAD = 8;

const renderLayer = (layer: ShapeLayer, index: number): React.ReactNode => {
  const cx = layer.x + layer.width / 2;
  const cy = layer.y + layer.height / 2;
  const rotate = layer.rotation ? `rotate(${layer.rotation} ${cx} ${cy})` : "";
  const flip = layer.flipH ? `translate(${2 * cx}, 0) scale(-1, 1)` : "";
  const transform = [rotate, flip].filter(Boolean).join(" ") || undefined;
  const common = { transform, fill: layer.fill, key: `${layer.id}-${index}` };

  if (layer.shapeType === "circle") {
    return (
      <ellipse
        {...common}
        cx={cx}
        cy={cy}
        rx={layer.width / 2}
        ry={layer.height / 2}
      />
    );
  }
  if (layer.shapeType === "triangle") {
    const points = `${cx},${layer.y} ${layer.x + layer.width},${layer.y + layer.height} ${layer.x},${layer.y + layer.height}`;
    return <polygon {...common} points={points} />;
  }
  if (layer.shapeType === "hexagon") {
    const w = layer.width;
    const h = layer.height;
    const x = layer.x;
    const y = layer.y;
    const points = [
      [x + w * 0.25, y],
      [x + w * 0.75, y],
      [x + w, y + h / 2],
      [x + w * 0.75, y + h],
      [x + w * 0.25, y + h],
      [x, y + h / 2],
    ]
      .map(([px, py]) => `${px},${py}`)
      .join(" ");
    return <polygon {...common} points={points} />;
  }
  if (layer.shapeType === "diamond") {
    const points = `${cx},${layer.y} ${layer.x + layer.width},${cy} ${cx},${layer.y + layer.height} ${layer.x},${cy}`;
    return <polygon {...common} points={points} />;
  }
  return (
    <rect
      {...common}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
    />
  );
};

export const PatternPreview: React.FC<PatternPreviewProps> = ({ layers, size }) => {
  if (layers.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-[var(--s-border)] flex items-center justify-center text-[11px] text-[var(--s-text-muted)]"
        style={{ width: size, height: size }}
      >
        no preview
      </div>
    );
  }

  const minX = Math.min(...layers.map((l) => l.x));
  const minY = Math.min(...layers.map((l) => l.y));
  const maxX = Math.max(...layers.map((l) => l.x + l.width));
  const maxY = Math.max(...layers.map((l) => l.y + l.height));
  const vbW = Math.max(maxX - minX, 1);
  const vbH = Math.max(maxY - minY, 1);

  return (
    <div
      className="rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-canvas)] overflow-hidden"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`${minX - PREVIEW_PAD} ${minY - PREVIEW_PAD} ${vbW + PREVIEW_PAD * 2} ${vbH + PREVIEW_PAD * 2}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {layers.map((layer, idx) => renderLayer(layer, idx))}
      </svg>
    </div>
  );
};
