import { callApi } from "../../lib/api-client";
import type { RecipeBody } from "./recipe-path";

export type RecipeSort = "recent" | "trending";

export interface Recipe {
  id: string;
  name: string;
  authorName: string | null;
  recipe: RecipeBody;
  thumbnail: string | null;
  useCount: number;
  createdAt: string;
  parentId: string | null;
  parentName: string | null;
}

interface RecipeListResponse {
  items: Recipe[];
  total: number;
  limit: number;
  offset: number;
}

export interface PublishRecipeInput {
  name: string;
  authorName?: string;
  recipe: RecipeBody;
  thumbnail?: string;
  parentId?: string;
}

export const fetchRecipes = (sort: RecipeSort, limit: number, offset: number) =>
  callApi<RecipeListResponse>(`/api/recipes?sort=${sort}&limit=${limit}&offset=${offset}`);

export const fetchRecipe = (id: string): Promise<Recipe | null> =>
  callApi<Recipe>(`/api/recipes/${encodeURIComponent(id)}`);

export const publishRecipe = (input: PublishRecipeInput) =>
  callApi<{ id: string }>("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const markRecipeUsed = (id: string): void => {
  void callApi(`/api/recipes/${id}/use`, { method: "POST" }).catch(() => undefined);
};
