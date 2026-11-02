import type { TextListStyle } from "../../../model/text-layout-types";

const BULLET_MARKER = "•";
export const LIST_GUTTER_EM = 1.5;

const LIST_STYLES: ReadonlySet<unknown> = new Set<TextListStyle>(["none", "bullet", "number"]);

const isListStyle = (value: unknown): value is TextListStyle => LIST_STYLES.has(value);

const listStyleAt = (listStyles: TextListStyle[] | undefined, index: number): TextListStyle => {
  const style: unknown = listStyles?.[index];
  return isListStyle(style) ? style : "none";
};

export const buildListMarkers = (styles: TextListStyle[]): string[] => {
  let counter = 0;
  return styles.map((style) => {
    if (style !== "number") counter = 0;
    if (style === "bullet") return BULLET_MARKER;
    if (style === "number") {
      counter += 1;
      return `${counter}.`;
    }
    return "";
  });
};

export const paragraphListStyles = (listStyles: TextListStyle[] | undefined, count: number): TextListStyle[] =>
  Array.from({ length: count }, (_, index) => listStyleAt(listStyles, index));
