import React from "react";
import type { ShapeLayer } from "../../../data/studioTypes";

const starPoints = (
  cx: number, cy: number,
  rx: number, ry: number,
  irx: number, iry: number,
  n: number,
): string => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const angle = (i * Math.PI) / n - Math.PI / 2;
    const [ox, oy] = i % 2 === 0 ? [rx, ry] : [irx, iry];
    pts.push(`${cx + ox * Math.cos(angle)},${cy + oy * Math.sin(angle)}`);
  }
  return pts.join(" ");
};

const polygonPoints = (cx: number, cy: number, rx: number, ry: number, n: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    pts.push(`${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`);
  }
  return pts.join(" ");
};

interface ShapeSvgContentProps {
  layer: ShapeLayer;
  width: number;
  height: number;
}

export const ShapeSvgContent: React.FC<ShapeSvgContentProps> = ({ layer, width: W, height: H }) => {
  const { shapeType, fill, stroke, strokeWidth: sw, borderRadius: br } = layer;
  const m = sw / 2;
  const cx = W / 2;
  const cy = H / 2;

  switch (shapeType) {
    case "rect":
      return (
        <rect
          x={m} y={m}
          width={W - sw} height={H - sw}
          rx={br} ry={br}
          fill={fill} stroke={stroke} strokeWidth={sw}
        />
      );
    case "circle":
      return (
        <ellipse
          cx={cx} cy={cy}
          rx={cx - m} ry={cy - m}
          fill={fill} stroke={stroke} strokeWidth={sw}
        />
      );
    case "triangle":
      return (
        <polygon
          points={`${cx},${m} ${W - m},${H - m} ${m},${H - m}`}
          fill={fill} stroke={stroke} strokeWidth={sw}
        />
      );
    case "diamond":
      return (
        <polygon
          points={`${cx},${m} ${W - m},${cy} ${cx},${H - m} ${m},${cy}`}
          fill={fill} stroke={stroke} strokeWidth={sw}
        />
      );
    case "star": {
      const orx = cx - m;
      const ory = cy - m;
      return (
        <polygon
          points={starPoints(cx, cy, orx, ory, orx * 0.42, ory * 0.42, 5)}
          fill={fill} stroke={stroke} strokeWidth={sw}
        />
      );
    }
    case "pentagon":
      return (
        <polygon
          points={polygonPoints(cx, cy, cx - m, cy - m, 5)}
          fill={fill} stroke={stroke} strokeWidth={sw}
        />
      );
    case "hexagon":
      return (
        <polygon
          points={polygonPoints(cx, cy, cx - m, cy - m, 6)}
          fill={fill} stroke={stroke} strokeWidth={sw}
        />
      );
    case "line":
      return (
        <line
          x1={0} y1={cy} x2={W} y2={cy}
          stroke={stroke || fill}
          strokeWidth={Math.max(sw, 2)}
          strokeLinecap="round"
        />
      );
    case "arrow": {
      const headSize = Math.min(W * 0.2, H * 0.5, 30);
      return (
        <path
          d={`M${m},${cy} L${W - headSize},${cy} M${W - headSize},${cy - headSize * 0.6} L${W - m},${cy} L${W - headSize},${cy + headSize * 0.6}`}
          fill="none"
          stroke={stroke || fill}
          strokeWidth={Math.max(sw, 2)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
    case "frame-thin": {
      const t = 3;
      return (
        <rect x={t} y={t} width={W - t * 2} height={H - t * 2}
          fill="none" stroke={fill || stroke} strokeWidth={t} />
      );
    }
    case "frame-thick": {
      const t = Math.min(W, H) * 0.08;
      return (
        <rect x={t / 2} y={t / 2} width={W - t} height={H - t}
          fill="none" stroke={fill || stroke} strokeWidth={t} />
      );
    }
    case "frame-double": {
      const o = 4;
      const i = 10;
      return (
        <>
          <rect x={o / 2} y={o / 2} width={W - o} height={H - o}
            fill="none" stroke={fill || stroke} strokeWidth={2} />
          <rect x={i} y={i} width={W - i * 2} height={H - i * 2}
            fill="none" stroke={fill || stroke} strokeWidth={2} />
        </>
      );
    }
    case "frame-round": {
      const t = 5;
      const r = Math.min(W, H) * 0.15;
      return (
        <rect x={t / 2} y={t / 2} width={W - t} height={H - t}
          rx={r} ry={r}
          fill="none" stroke={fill || stroke} strokeWidth={t} />
      );
    }
    default:
      return null;
  }
};
