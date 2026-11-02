import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";

export const pageRenderTemplate = (page: TemplatePage): TemplateDef => ({
  id: `page-render-${page.id}`,
  name: page.name || "Page",
  category: "poster",
  width: page.width,
  height: page.height,
  background: page.background,
  exportScale: 1,
  layers: [],
});
