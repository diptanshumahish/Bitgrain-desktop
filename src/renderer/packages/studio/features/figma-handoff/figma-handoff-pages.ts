import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { makeBlankPage, nextPageX } from "@bitgrain/studio-core/templates/template-pages";
import { parseViewBox } from "../svg-import/walk/viewbox";
import { svgMarkupToLayer } from "../svg-import/intake/parse-svg-markup";
import { canvasMeasurer, finalizeImportedLayer } from "../svg-import/intake/finalize-layers";

const PAGE_BACKGROUND = "#ffffff";
const FALLBACK_EDGE = 1080;
const EXACT_FIT = 1;
const SVG_MIME = "image/svg+xml";

interface FigmaPagesResult {
  pages: TemplatePage[];
  skipped: number;
}

interface SvgSize {
  width: number;
  height: number;
}

const positiveNumber = (raw: string | null): number | null => {
  const value = Number.parseFloat(raw ?? "");
  return Number.isFinite(value) && value > 0 ? value : null;
};

const svgSize = (markup: string): SvgSize => {
  const root = new DOMParser().parseFromString(markup, SVG_MIME).documentElement;
  const viewBox = parseViewBox(root.getAttribute("viewBox"));
  return {
    width: positiveNumber(root.getAttribute("width")) ?? viewBox?.width ?? FALLBACK_EDGE,
    height: positiveNumber(root.getAttribute("height")) ?? viewBox?.height ?? FALLBACK_EDGE,
  };
};

const pageFor = async (markup: string, index: number, x: number, pageNumber: number): Promise<{ page: TemplatePage; skipped: number } | null> => {
  const size = svgSize(markup);
  const name = `From Figma ${index + 1}`;
  const result = svgMarkupToLayer(markup, { ...size, fitRatio: EXACT_FIT }, canvasMeasurer, name);
  if (!result) return null;
  const layer = await finalizeImportedLayer(result.layer, size.width);
  const blank = makeBlankPage(PAGE_BACKGROUND, pageNumber, Math.round(size.width), Math.round(size.height), x, 0);
  return { page: { ...blank, name, layers: [layer] }, skipped: result.skipped.length };
};

export const buildFigmaPages = async (markups: string[], existing: TemplatePage[]): Promise<FigmaPagesResult> => {
  const pages: TemplatePage[] = [];
  let skipped = 0;
  for (const [index, markup] of markups.entries()) {
    const built = await pageFor(markup, index, nextPageX([...existing, ...pages]), existing.length + pages.length + 1);
    if (!built) continue;
    pages.push(built.page);
    skipped += built.skipped;
  }
  return { pages, skipped };
};
