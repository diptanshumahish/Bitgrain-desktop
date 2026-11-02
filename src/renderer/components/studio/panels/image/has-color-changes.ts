import type { ImageFilters } from "../../../../data/studioTypes";
import type { ColorGrade } from "../../../../modules/grading/engine/grade-types";
import type { MaskLayer } from "../../../../modules/grading/mask/mask-types";
import { isNeutralGrade } from "../../../../modules/grading/engine/grade-checks";

export const hasFilterChanges = (filters?: ImageFilters): boolean =>
  !!filters && Object.values(filters).some((value) => value !== undefined);

export const hasColorChanges = (filters?: ImageFilters, grade?: ColorGrade, masks?: MaskLayer[]): boolean =>
  hasFilterChanges(filters) || !isNeutralGrade(grade) || (masks?.length ?? 0) > 0;
