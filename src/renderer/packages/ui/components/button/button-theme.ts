export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonTheme<Variant extends string> {
  base: string;
  shapeBox: string;
  sizeText: Record<ButtonSize, string>;
  sizeLink: Record<ButtonSize, string>;
  variants: Record<Variant | "link", string>;
}

export const SHAPE_LINK = "rounded-sm";

export const SIZE_ICON_ONLY: Record<ButtonSize, string> = {
  xs: "h-7 w-7",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export const SPINNER_PX: Record<ButtonSize, number> = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
};
