import type { ShapeLayer } from "../../../../data/studioTypes";

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

export const buildShapeSvg = (layer: ShapeLayer): string => {
  const { shapeType, fill, stroke, strokeWidth: sw, borderRadius: br } = layer;
  const W = layer.width;
  const H = layer.height;
  const m = sw / 2;
  const cx = W / 2;
  const cy = H / 2;
  let inner = "";

  switch (shapeType) {
    case "rect":
      inner = `<rect x="${m}" y="${m}" width="${W - sw}" height="${H - sw}" rx="${br}" ry="${br}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case "circle":
      inner = `<ellipse cx="${cx}" cy="${cy}" rx="${cx - m}" ry="${cy - m}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case "triangle":
      inner = `<polygon points="${cx},${m} ${W - m},${H - m} ${m},${H - m}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case "diamond":
      inner = `<polygon points="${cx},${m} ${W - m},${cy} ${cx},${H - m} ${m},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case "star": {
      const orx = cx - m;
      const ory = cy - m;
      inner = `<polygon points="${starPoints(cx, cy, orx, ory, orx * 0.42, ory * 0.42, 5)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    }
    case "pentagon":
      inner = `<polygon points="${polygonPoints(cx, cy, cx - m, cy - m, 5)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case "hexagon":
      inner = `<polygon points="${polygonPoints(cx, cy, cx - m, cy - m, 6)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case "line":
      inner = `<line x1="0" y1="${cy}" x2="${W}" y2="${cy}" stroke="${stroke || fill}" stroke-width="${Math.max(sw, 2)}" stroke-linecap="round"/>`;
      break;
    case "arrow": {
      const headSize = Math.min(W * 0.2, H * 0.5, 30);
      inner = `<path d="M${m},${cy} L${W - headSize},${cy} M${W - headSize},${cy - headSize * 0.6} L${W - m},${cy} L${W - headSize},${cy + headSize * 0.6}" fill="none" stroke="${stroke || fill}" stroke-width="${Math.max(sw, 2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      break;
    }
    case "frame-thin": {
      const t = 3;
      inner = `<rect x="${t}" y="${t}" width="${W - t * 2}" height="${H - t * 2}" fill="none" stroke="${fill || stroke}" stroke-width="${t}"/>`;
      break;
    }
    case "frame-thick": {
      const t = Math.min(W, H) * 0.08;
      inner = `<rect x="${t / 2}" y="${t / 2}" width="${W - t}" height="${H - t}" fill="none" stroke="${fill || stroke}" stroke-width="${t}"/>`;
      break;
    }
    case "frame-double": {
      const o = 4;
      const i = 10;
      inner = `<rect x="${o / 2}" y="${o / 2}" width="${W - o}" height="${H - o}" fill="none" stroke="${fill || stroke}" stroke-width="2"/><rect x="${i}" y="${i}" width="${W - i * 2}" height="${H - i * 2}" fill="none" stroke="${fill || stroke}" stroke-width="2"/>`;
      break;
    }
    case "frame-round": {
      const t = 5;
      const r = Math.min(W, H) * 0.15;
      inner = `<rect x="${t / 2}" y="${t / 2}" width="${W - t}" height="${H - t}" rx="${r}" ry="${r}" fill="none" stroke="${fill || stroke}" stroke-width="${t}"/>`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${inner}</svg>`;
};
