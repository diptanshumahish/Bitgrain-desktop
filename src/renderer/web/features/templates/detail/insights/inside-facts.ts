import { describeTemplateSizeOnly } from "../../data/size-names";
import { studioDisplaySize } from "@bitgrain/platform/templates/cards/studio-display-size";
import type { TemplateDetail, TemplateInsights } from "../template-detail-types";
import { countLabel, joinWithAnd } from "./count-label";
import { effectLabels } from "./effect-labels";
import { isPrintCategory, printSizeLabel, type PixelSize } from "./print-size";

interface InsideFact {
  label: string;
  value: string;
}

const exportSizeOf = (detail: TemplateDetail, insights: TemplateInsights): PixelSize => {
  const display = studioDisplaySize({ width: detail.width, height: detail.height });
  return {
    width: Math.round(display.width * insights.exportScale),
    height: Math.round(display.height * insights.exportScale),
  };
};

const layerSummary = (insights: TemplateInsights): string => {
  const parts = [
    insights.textLayers > 0 ? countLabel(insights.textLayers, "text layer", "text layers") : "",
    insights.imageLayers > 0 ? countLabel(insights.imageLayers, "photo layer", "photo layers") : "",
    insights.shapeLayers > 0 ? countLabel(insights.shapeLayers, "shape", "shapes") : "",
  ].filter(Boolean);
  return joinWithAnd(parts);
};

const insightFacts = (detail: TemplateDetail, insights: TemplateInsights): InsideFact[] => {
  const exportSize = exportSizeOf(detail, insights);
  const effects = effectLabels(insights.effects);
  const facts: InsideFact[] = [
    { label: "Full resolution export", value: `${exportSize.width} × ${exportSize.height} px` },
  ];
  if (isPrintCategory(detail.category)) facts.push({ label: "Print size", value: printSizeLabel(exportSize) });
  if (insights.fonts.length > 0) facts.push({ label: "Fonts", value: joinWithAnd(insights.fonts) });
  const layers = layerSummary(insights);
  if (layers) facts.push({ label: "Layers", value: layers });
  if (effects.length > 0) facts.push({ label: "Effects", value: joinWithAnd(effects) });
  return facts;
};

export const insideFacts = (detail: TemplateDetail): InsideFact[] => {
  const base: InsideFact[] = [
    { label: "Pages", value: countLabel(detail.pageCount, "page", "pages") },
    { label: "Size", value: `${describeTemplateSizeOnly(detail, detail.category)} px` },
  ];
  return detail.insights ? [...base, ...insightFacts(detail, detail.insights)] : base;
};
