export type RatingSurface = "editor" | "studio";

export type RatingValue = "up" | "down";

export interface RatingContext {
  signature: string;
  properties: Record<string, unknown>;
}

export interface RatingVote {
  rating: RatingValue;
  signature: string;
}
