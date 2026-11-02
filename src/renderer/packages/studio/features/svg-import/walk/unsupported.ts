import type { ComputedStyle } from "../style/computed-style";
import { referencedId, type WalkContext } from "./walk-context";

const SILENT_TAGS: ReadonlySet<string> = new Set([
  "defs", "title", "desc", "metadata", "style", "lineargradient", "radialgradient", "clippath", "mask",
  "symbol", "pattern", "filter", "marker", "script", "sodipodi:namedview", "namedview",
]);

const hasValue = (value: string | undefined): boolean => Boolean(value) && value !== "none";

const isRectClip = (element: Element | undefined): boolean => {
  if (!element) return false;
  const shapes = Array.from(element.children);
  return shapes.length === 1 && shapes[0].tagName.toLowerCase() === "rect" && !shapes[0].getAttribute("transform");
};

export const isSilentTag = (tag: string): boolean => SILENT_TAGS.has(tag);

export const reportUnsupportedEffects = (style: ComputedStyle, ctx: WalkContext): void => {
  if (hasValue(style.filter)) ctx.skipped.skip("filter");
  if (hasValue(style.mask)) ctx.skipped.skip("mask");
  if (!hasValue(style["clip-path"])) return;
  const clipId = referencedId(style["clip-path"] ?? null);
  if (!isRectClip(clipId ? ctx.ids.get(clipId) : undefined)) ctx.skipped.skip("clip path");
};

export const localTagName = (element: Element): string => {
  const tag = element.tagName.toLowerCase();
  const colon = tag.indexOf(":");
  return colon >= 0 && tag.startsWith("svg:") ? tag.slice(colon + 1) : tag;
};

export const layerNameFor = (element: Element, fallback: string): string => {
  const raw = element.getAttribute("data-name") ?? element.getAttribute("inkscape:label") ?? element.getAttribute("id");
  if (!raw) return fallback;
  return raw.replace(/_/g, " ").trim() || fallback;
};
