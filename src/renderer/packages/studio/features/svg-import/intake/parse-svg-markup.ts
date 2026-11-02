import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { walkSvgDocument, type PlacementTarget } from "../walk/walk-svg";
import { buildImportRoot } from "../build/build-layers";
import type { TextMeasurer } from "../build/build-text";

interface SvgImportResult {
  layer: Layer;
  skipped: string[];
}

const SVG_MIME = "image/svg+xml";

const parseSvgDocument = (markup: string): Document | null => {
  const doc = new DOMParser().parseFromString(markup, SVG_MIME);
  if (doc.getElementsByTagName("parsererror").length > 0) return null;
  return doc;
};

const svgDocumentToLayer = (
  doc: Document,
  target: PlacementTarget,
  measure: TextMeasurer,
  name: string,
): SvgImportResult | null => {
  const walked = walkSvgDocument(doc, target);
  if (!walked) return null;
  const layer = buildImportRoot(walked.nodes, measure, name);
  return layer ? { layer, skipped: walked.skipped } : null;
};

export const svgMarkupToLayer = (
  markup: string,
  target: PlacementTarget,
  measure: TextMeasurer,
  name: string,
): SvgImportResult | null => {
  const doc = parseSvgDocument(markup);
  return doc ? svgDocumentToLayer(doc, target, measure, name) : null;
};
