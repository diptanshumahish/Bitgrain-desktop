import type { RecipeInputs, RecipeStep } from "../recipe-types";

export const paperSteps = (inputs: RecipeInputs): RecipeStep[] =>
  inputs.printFinish
    ? [{ id: "finish", kind: "finish", title: "Paper texture", detail: "Finish", panel: "finish", removal: { type: "finish" } }]
    : [];
