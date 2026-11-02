import type { ComponentEntry, VariantProps } from "../../model/component-types";

const matchScore = (candidate: VariantProps, wanted: VariantProps): number =>
  Object.entries(wanted).filter(([name, value]) => candidate[name] === value).length;

export const pickVariant = (
  members: ComponentEntry[],
  current: VariantProps,
  property: string,
  value: string,
): ComponentEntry | null => {
  const wanted = { ...current, [property]: value };
  const candidates = members.filter((member) => member.variant?.[property] === value);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, candidate) =>
    matchScore(candidate.variant ?? {}, wanted) > matchScore(best.variant ?? {}, wanted) ? candidate : best,
  );
};
