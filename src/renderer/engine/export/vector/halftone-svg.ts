import type { DotScreen, VectorDot } from "./halftone-dots";
import type { HalftoneShape } from "../../plugins/halftone/halftone-defaults";
import { formatSvgNumber } from "./svg-format";
import { svgShapeStyle, type SvgShapeStyle } from "./svg-dot-shape";

export interface HalftoneSvgInput {
  screens: DotScreen[];
  width: number;
  height: number;
  cellPx: number;
  shape: HalftoneShape;
  paper: string;
  transparent: boolean;
  outputWidth: number;
  outputHeight: number;
}

interface DotGroup {
  fill: string;
  diameter: number;
  dots: VectorDot[];
}

const DIAMETER_STEPS_PER_CELL = 50;
const blendStyle = (blend: DotScreen["blend"]): string => (blend === "normal" ? "" : ` style="mix-blend-mode:${blend}"`);

const quantizeDiameter = (radius: number): number =>
  Math.max(1, Math.round(radius * 2 * DIAMETER_STEPS_PER_CELL)) / DIAMETER_STEPS_PER_CELL;

const groupDots = (dots: VectorDot[]): DotGroup[] => {
  const groups = new Map<string, DotGroup>();
  for (const dot of dots) {
    const diameter = quantizeDiameter(dot.radius);
    const key = `${dot.fill}${diameter}`;
    const existing = groups.get(key);
    if (existing) existing.dots.push(dot);
    else groups.set(key, { fill: dot.fill, diameter, dots: [dot] });
  }
  return [...groups.values()];
};

const joinPair = (first: number, second: number): string => `${first}${second < 0 ? "" : " "}${second}`;

const COORDINATE_PRECISION = 1000;

const roundCoordinate = (value: number): number => Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;

const dotPathData = (dots: VectorDot[], style: SvgShapeStyle): string => {
  const points = dots.map((dot) => style.mapPoint(dot.col, dot.row).map(roundCoordinate));
  const advance = style.stroke === "h1" ? 1 : 0;
  const parts: string[] = [`M${joinPair(points[0][0], points[0][1])}${style.stroke}`];
  for (let index = 1; index < points.length; index++) {
    const dx = roundCoordinate(points[index][0] - points[index - 1][0] - advance);
    const dy = roundCoordinate(points[index][1] - points[index - 1][1]);
    parts.push(`m${joinPair(dx, dy)}${style.stroke}`);
  }
  return parts.join("");
};

const groupMarkup = (group: DotGroup, style: SvgShapeStyle): string =>
  `<path stroke="${group.fill}" stroke-width="${formatSvgNumber(group.diameter * style.strokeScale)}" d="${dotPathData(group.dots, style)}"/>`;

const screenTransform = (screen: DotScreen, input: HalftoneSvgInput): string =>
  `translate(${formatSvgNumber(input.width / 2)} ${formatSvgNumber(input.height / 2)}) rotate(${formatSvgNumber(screen.angle)}) scale(${formatSvgNumber(input.cellPx)})`;

const screenMarkup = (screen: DotScreen, input: HalftoneSvgInput): string => {
  const style = svgShapeStyle(input.shape);
  const blend = blendStyle(screen.blend);
  const groups = groupDots(screen.dots).map((group) => groupMarkup(group, style)).join("\n");
  const transform = `${screenTransform(screen, input)} ${style.wrapTransform}`.trim();
  return `<g transform="${transform}" fill="none" stroke-linecap="${style.cap}"${blend}>\n${groups}\n</g>`;
};

export const buildHalftoneSvg = (input: HalftoneSvgInput): string => {
  const { width, height } = input;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${input.outputWidth}" height="${input.outputHeight}" viewBox="0 0 ${width} ${height}">`,
    `<defs><clipPath id="frame"><rect width="${width}" height="${height}"/></clipPath></defs>`,
  ];
  if (!input.transparent) parts.push(`<rect width="${width}" height="${height}" fill="${input.paper}"/>`);
  parts.push('<g clip-path="url(#frame)">');
  for (const screen of input.screens) parts.push(screenMarkup(screen, input));
  parts.push("</g></svg>");
  return parts.join("\n");
};
