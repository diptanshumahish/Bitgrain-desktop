import type { ImageFilters } from "@bitgrain/studio-core/model/studio-types";
import type { ColorGrade } from "@bitgrain/engine/grading/engine/grade-types";
import type { MaskLayer } from "@bitgrain/engine/grading/mask/mask-types";
import { isNeutralGrade } from "@bitgrain/engine/grading/engine/grade-checks";

export const hasFilterChanges = (filters?: ImageFilters): boolean =>
  !!filters && Object.values(filters).some((value) => value !== undefined);

export const hasColorChanges = (filters?: ImageFilters, grade?: ColorGrade, masks?: MaskLayer[]): boolean =>
  hasFilterChanges(filters) || !isNeutralGrade(grade) || (masks?.length ?? 0) > 0;
