import { signal } from "@bitgrain/core/signal";
import { fetchRecipes } from "@bitgrain/darkroom/recipe/publish/recipes-api";

const AVAILABILITY_PROBE_LIMIT = 1;
const AVAILABILITY_PROBE_OFFSET = 0;

export const recipesAvailableSignal = signal<boolean>(false);

const availabilityRequest: { pending: Promise<void> | null } = { pending: null };

const probeRecipes = async (): Promise<void> => {
  const data = await fetchRecipes("recent", AVAILABILITY_PROBE_LIMIT, AVAILABILITY_PROBE_OFFSET);
  recipesAvailableSignal.value = (data?.total ?? 0) > 0;
};

export const loadRecipesAvailability = (): Promise<void> => {
  availabilityRequest.pending ??= probeRecipes();
  return availabilityRequest.pending;
};
