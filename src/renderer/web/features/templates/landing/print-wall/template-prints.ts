import { resolveAssetUrl } from "@bitgrain/api/api-client";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import type { WallPrint } from "./print-wall-prints";

const ROW_PRINT_LIMIT = 14;
const MIN_ROW_PRINTS = 10;

const toWallPrint = (template: TemplateSummary): WallPrint | null => {
  const source = resolveAssetUrl(template.thumbnail);
  if (!source) return null;
  return { key: template.id, src: source, width: template.width, height: template.height };
};

export function templateWallPrints(templates: TemplateSummary[]): WallPrint[] {
  const prints = templates
    .slice(0, ROW_PRINT_LIMIT)
    .map(toWallPrint)
    .filter((print): print is WallPrint => print !== null);
  if (prints.length === 0) return [];
  const repeats = Math.ceil(MIN_ROW_PRINTS / prints.length);
  return Array.from({ length: repeats }, () => prints).flat();
}
