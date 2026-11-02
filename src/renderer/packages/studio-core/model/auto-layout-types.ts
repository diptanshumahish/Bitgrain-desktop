export type ChildSizing = "fixed" | "hug" | "fill";

export type HorizontalConstraint = "left" | "right" | "left-right" | "center" | "scale";
export type VerticalConstraint = "top" | "bottom" | "top-bottom" | "center" | "scale";

export interface LayerConstraints {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
}

export interface LayoutPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayoutChildOptions {
  constraints?: LayerConstraints;
  layoutSizingH?: ChildSizing;
  layoutSizingV?: ChildSizing;
  layoutAbsolute?: boolean;
}

export const DEFAULT_CONSTRAINTS: LayerConstraints = {
  horizontal: "left",
  vertical: "top",
};
