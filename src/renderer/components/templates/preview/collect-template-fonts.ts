import type { Layer, TemplateDef } from "../../../data/studioTypes";

const FONT_LIMIT = 4;

const familyName = (stack: string): string => stack.split(",")[0].replace(/['"]/g, "").trim();

const collectFromLayers = (layers: Layer[], found: Set<string>): void => {
  for (const layer of layers) {
    if (layer.type === "text" && layer.fontFamily) found.add(familyName(layer.fontFamily));
    if (layer.type === "group" || layer.type === "frame") collectFromLayers(layer.layers, found);
  }
};

export function collectTemplateFonts(template: TemplateDef): string[] {
  const found = new Set<string>();
  collectFromLayers(template.layers, found);
  for (const page of template.pages ?? []) collectFromLayers(page.layers, found);
  return [...found].slice(0, FONT_LIMIT);
}
