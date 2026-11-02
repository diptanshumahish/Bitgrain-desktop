export const ZERO_WIDTH = "\u200b";

export type RichStyleProp =
  | "color"
  | "fontFamily"
  | "fontWeight"
  | "fontStyle"
  | "fontSize"
  | "textDecorationLine"
  | "textTransform"
  | "letterSpacing";

export interface StyleField<T> {
  value: T | null;
  distinct: T[];
}

export interface RunStyle {
  color: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fontSize: number;
  underline: boolean;
  strike: boolean;
  textTransform: string;
  letterSpacing: number;
}

export type BaseTextStyle = RunStyle;

export interface ResolvedTextStyle {
  color: StyleField<string>;
  fontFamily: StyleField<string>;
  fontWeight: StyleField<string>;
  fontSize: StyleField<number>;
  italic: StyleField<boolean>;
  underline: StyleField<boolean>;
  strike: StyleField<boolean>;
  textTransform: StyleField<string>;
  letterSpacing: StyleField<number>;
  collapsed: boolean;
}

const RGB_MAX = 255;

const toHexByte = (channel: number): string =>
  Math.round(channel).toString(16).padStart(2, "0");

export const normalizeColor = (input: string): string => {
  const value = input.trim().toLowerCase();
  if (value.startsWith("#")) return value;
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return value;
  const parts = match[1].split(/[,/\s]+/).filter(Boolean);
  const hex = `#${toHexByte(Number(parts[0]))}${toHexByte(Number(parts[1]))}${toHexByte(Number(parts[2]))}`;
  const alpha = parts[3] !== undefined ? Number(parts[3]) : 1;
  return alpha >= 1 ? hex : hex + toHexByte(alpha * RGB_MAX);
};

export const normalizeWeight = (weight: string): string => {
  if (weight === "bold") return "700";
  if (weight === "normal") return "400";
  return weight;
};

export const normalizeFamily = (input: string): string => {
  const tokens = input
    .split(",")
    .map((token) => token.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
  if (tokens.length === 0) return input.trim();
  const [primary, ...rest] = tokens;
  return rest.length > 0 ? `'${primary}', ${rest.join(", ")}` : `'${primary}'`;
};
