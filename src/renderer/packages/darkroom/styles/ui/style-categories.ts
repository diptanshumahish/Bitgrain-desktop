import { signal } from "@bitgrain/core/signal";
import type { StyleCategory } from "@bitgrain/engine/styles/engine/style-types";
import { STYLE_DEFINITIONS } from "@bitgrain/engine/styles/engine/style-registry";
import type { StyleDefinition } from "@bitgrain/engine/styles/engine/style-definition";

const CATEGORY_LABELS: Record<StyleCategory, string> = {
  ascii: "Text",
  pixel: "Tiles",
  geometric: "Shapes",
  light: "Light",
  print: "Print",
  distort: "Warp",
  blur: "Focus",
  glitch: "Signal",
  glass: "Glass",
  material: "Material",
};

const CATEGORY_ORDER: readonly StyleCategory[] = [
  "ascii", "pixel", "geometric", "light", "print", "glitch", "glass", "material", "distort", "blur",
];

interface CategoryOption {
  id: StyleCategory;
  label: string;
}

export const AVAILABLE_CATEGORIES: readonly CategoryOption[] = CATEGORY_ORDER
  .filter((category) => STYLE_DEFINITIONS.some((definition) => definition.category === category))
  .map((category) => ({ id: category, label: CATEGORY_LABELS[category] }));

export const stylesIn = (category: StyleCategory): readonly StyleDefinition[] =>
  STYLE_DEFINITIONS.filter((definition) => definition.category === category);

export const CLASSIC_CATEGORY = "classic";

type PickerCategory = StyleCategory | typeof CLASSIC_CATEGORY;

export const styleCategorySignal = signal<PickerCategory | null>(null);
