import type { RecipeInputs, RecipeStep } from "../recipe-types";

const paletteSteps = (inputs: RecipeInputs): RecipeStep[] => {
  if (!inputs.palette) return [];
  const detail = `Palette, ${inputs.palette.colors.length} inks`;
  return [{ id: "palette", kind: "colour", title: inputs.palette.name, detail, panel: "palette", removal: { type: "palette" } }];
};

const monoSteps = (inputs: RecipeInputs): RecipeStep[] =>
  inputs.isColor
    ? []
    : [{ id: "mono", kind: "colour", title: "Black and white", detail: "Colour", panel: "colour", removal: { type: "mono" } }];

export const colourSteps = (inputs: RecipeInputs): RecipeStep[] => [...paletteSteps(inputs), ...monoSteps(inputs)];
