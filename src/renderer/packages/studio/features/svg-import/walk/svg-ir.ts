import type { Matrix, Point } from "../geometry/matrix";
import type { Subpath } from "../geometry/subpath-types";
import type { LineCap, LineJoin } from "@bitgrain/studio-core/model/studio-types";

export interface IrStop {
  color: string;
  opacity: number;
  pos: number;
}

export interface IrGradient {
  kind: "linear" | "radial";
  stops: IrStop[];
  start: Point;
  end: Point;
  minorEnd: Point;
}

export type IrPaint =
  | { kind: "none" }
  | { kind: "color"; color: string }
  | { kind: "gradient"; gradient: IrGradient };

export interface IrStroke {
  paint: IrPaint;
  width: number;
  lineCap: LineCap;
  lineJoin: LineJoin;
  dash: [number, number] | null;
}

export interface IrPrimitive {
  shape: "rect" | "ellipse";
  matrix: Matrix;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

export interface IrPathNode {
  kind: "path";
  name: string;
  subpaths: Subpath[];
  fill: IrPaint;
  fillRule: "nonzero" | "evenodd";
  stroke: IrStroke | null;
  opacity: number;
  primitive: IrPrimitive | null;
}

export interface IrGroupNode {
  kind: "group";
  name: string;
  opacity: number;
  children: IrNode[];
}

export interface IrTextLine {
  text: string;
  x: number;
  y: number;
}

export interface IrTextNode {
  kind: "text";
  name: string;
  lines: IrTextLine[];
  matrix: Matrix;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  italic: boolean;
  color: string;
  anchor: "start" | "middle" | "end";
  letterSpacing: number;
  underline: boolean;
  opacity: number;
}

export interface IrImageNode {
  kind: "image";
  name: string;
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  matrix: Matrix;
  fit: "cover" | "contain" | "fill";
  opacity: number;
}

export type IrNode = IrPathNode | IrGroupNode | IrTextNode | IrImageNode;
