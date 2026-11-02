import { useSignalValue } from "@bitgrain/core/signal";
import { brightnessSignal, contrastSignal, ditherMethodSignal, hueSignal, isColorSignal, lutIdSignal, modesSignal, paletteSignal, saturationSignal } from "../state/transform-store";
import { printFinishSignal } from "@bitgrain/engine/finish/print-finish-state";
import { styleSettingsSignal } from "../styles/state/style-store";
import { colorGradeSignal } from "../grading/editor/editor-grade-store";
import { isNeutralGrade } from "@bitgrain/engine/grading/engine/grade-checks";
import { buildRecipe } from "./build-recipe";
import type { RecipeStep } from "./recipe-types";

export const useRecipe = (): RecipeStep[] => {
  const tone = {
    contrast: useSignalValue(contrastSignal),
    brightness: useSignalValue(brightnessSignal),
    saturation: useSignalValue(saturationSignal),
    hue: useSignalValue(hueSignal),
  };
  return buildRecipe({
    modes: useSignalValue(modesSignal),
    styleSettings: useSignalValue(styleSettingsSignal),
    ditherMethod: useSignalValue(ditherMethodSignal),
    palette: useSignalValue(paletteSignal),
    lutId: useSignalValue(lutIdSignal),
    isColor: useSignalValue(isColorSignal),
    tone,
    gradeIsNeutral: isNeutralGrade(useSignalValue(colorGradeSignal)),
    printFinish: useSignalValue(printFinishSignal),
  });
};
