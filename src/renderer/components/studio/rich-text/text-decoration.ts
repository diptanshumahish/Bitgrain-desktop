import type { TextDecorationLine } from "../../../data/studioTypes";

export interface DecorationFlags {
  underline: boolean;
  strike: boolean;
}

export type DecorationKind = keyof DecorationFlags;

const UNDERLINE_TAGS = ["U", "INS"];
const STRIKE_TAGS = ["S", "STRIKE", "DEL"];

export const parseDecoration = (value: string | undefined): DecorationFlags => ({
  underline: Boolean(value?.includes("underline")),
  strike: Boolean(value?.includes("line-through")),
});

export const composeDecoration = (flags: DecorationFlags): TextDecorationLine => {
  if (flags.underline && flags.strike) return "underline line-through";
  if (flags.underline) return "underline";
  if (flags.strike) return "line-through";
  return "none";
};

export const elementDecoration = (el: HTMLElement): DecorationFlags => {
  const fromStyle = parseDecoration(el.style.textDecorationLine || el.style.textDecoration);
  return {
    underline: fromStyle.underline || UNDERLINE_TAGS.includes(el.tagName),
    strike: fromStyle.strike || STRIKE_TAGS.includes(el.tagName),
  };
};

export const mergeDecoration = (outer: DecorationFlags, inner: DecorationFlags): DecorationFlags => ({
  underline: outer.underline || inner.underline,
  strike: outer.strike || inner.strike,
});

export const toggleDecoration = (current: DecorationFlags, kind: DecorationKind): TextDecorationLine =>
  composeDecoration({ ...current, [kind]: !current[kind] });
