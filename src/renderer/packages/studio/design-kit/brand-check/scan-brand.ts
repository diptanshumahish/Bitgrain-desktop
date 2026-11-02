import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { DesignKit } from "@bitgrain/studio-core/model/design-kit-types";
import { flattenLayers } from "../palette/walk-layers";
import type { BrandIssue, BrandReport } from "./brand-issue";
import { kitVocabulary, layerIssues, pageBackgroundIssues, type KitVocabulary } from "./layer-issues";

interface ScanMemo {
  pages: TemplatePage[] | null;
  kit: DesignKit | null;
  report: BrandReport;
}

const EMPTY_REPORT: BrandReport = { issues: [], offBrandLayerCount: 0 };

const lastScan: ScanMemo = { pages: null, kit: null, report: EMPTY_REPORT };

const pageIssues = (page: TemplatePage, vocab: KitVocabulary): BrandIssue[] => [
  ...pageBackgroundIssues(page, vocab),
  ...flattenLayers(page.layers)
    .filter((layer) => layer.visible !== false)
    .flatMap((layer) => layerIssues(page.id, layer, vocab)),
];

const buildReport = (pages: TemplatePage[], kit: DesignKit): BrandReport => {
  const vocab = kitVocabulary(kit);
  const issues = pages.flatMap((page) => pageIssues(page, vocab));
  const offBrandLayers = new Set(issues.map((issue) => `${issue.pageId}:${issue.layerId ?? "page"}`));
  return { issues, offBrandLayerCount: offBrandLayers.size };
};

export const scanBrand = (pages: TemplatePage[], kit: DesignKit | null): BrandReport => {
  if (!kit) return EMPTY_REPORT;
  if (lastScan.pages === pages && lastScan.kit === kit) return lastScan.report;
  const report = buildReport(pages, kit);
  lastScan.pages = pages;
  lastScan.kit = kit;
  lastScan.report = report;
  return report;
};
