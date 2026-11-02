import type { RecipeInputs, RecipeStep } from "./recipe-types";
import { lookSteps } from "./steps/look-steps";
import { effectSteps } from "./steps/effect-steps";
import { adjustSteps } from "./steps/adjust-steps";
import { colourSteps } from "./steps/colour-steps";
import { gradeSteps } from "./steps/grade-steps";
import { paperSteps } from "./steps/paper-steps";

export const buildRecipe = (inputs: RecipeInputs): RecipeStep[] => [
  ...adjustSteps(inputs),
  ...lookSteps(inputs),
  ...effectSteps(inputs),
  ...colourSteps(inputs),
  ...gradeSteps(inputs),
  ...paperSteps(inputs),
];
