import { signal } from "@bitgrain/core/signal";
import type { ColorGrade } from "@bitgrain/engine/grading/engine/grade-types";
import { DEFAULT_COLOR_GRADE } from "@bitgrain/engine/grading/engine/grade-defaults";
import { isNeutralGrade } from "@bitgrain/engine/grading/engine/grade-checks";

export const colorGradeSignal = signal<ColorGrade>(DEFAULT_COLOR_GRADE);

export const gradeForSnapshot = (): ColorGrade | undefined =>
  isNeutralGrade(colorGradeSignal.value) ? undefined : colorGradeSignal.value;

export const applyGradeFromSnapshot = (grade: ColorGrade | undefined): void => {
  colorGradeSignal.value = grade ?? DEFAULT_COLOR_GRADE;
};
