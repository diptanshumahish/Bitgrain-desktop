import { getLUT } from "@bitgrain/engine/color/luts";
import type { RecipeInputs, RecipeStep } from "../recipe-types";

const GRADE_DETAIL = "Film grade";

export const gradeSteps = (inputs: RecipeInputs): RecipeStep[] => {
  if (!inputs.lutId) return [];
  const title = getLUT(inputs.lutId)?.name ?? GRADE_DETAIL;
  return [{ id: "lut", kind: "grade", title, detail: GRADE_DETAIL, panel: "lut", removal: { type: "lut" } }];
};
