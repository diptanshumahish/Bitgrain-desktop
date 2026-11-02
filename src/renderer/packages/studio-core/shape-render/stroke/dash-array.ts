import type { DashStyle } from "../../model/studio-types";
import { dashArrayFor } from "../../geometry/vector-utils";

export const resolveDashArray = (
  dashStyle: DashStyle | undefined,
  dashPattern: [number, number] | undefined,
  strokeWidth: number,
): string | undefined => {
  if (dashPattern && dashPattern[0] > 0) return `${dashPattern[0]} ${Math.max(0, dashPattern[1])}`;
  return dashArrayFor(dashStyle ?? "solid", strokeWidth);
};
