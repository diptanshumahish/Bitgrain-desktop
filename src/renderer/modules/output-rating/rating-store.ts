import { signal } from "../../lib/signal";
import { trackEvent } from "../../lib/tracker";
import type { RatingContext, RatingSurface, RatingValue, RatingVote } from "./rating-types";

type RatingVotes = Record<RatingSurface, RatingVote | null>;

export const ratingVotesSignal = signal<RatingVotes>({ editor: null, studio: null });

export function activeRatingFor(votes: RatingVotes, surface: RatingSurface, signature: string): RatingValue | null {
  const vote = votes[surface];
  return vote && vote.signature === signature ? vote.rating : null;
}

export function rateOutput(surface: RatingSurface, rating: RatingValue, context: RatingContext): void {
  const previousRating = activeRatingFor(ratingVotesSignal.value, surface, context.signature);
  const isUndo = previousRating === rating;
  ratingVotesSignal.value = {
    ...ratingVotesSignal.value,
    [surface]: isUndo ? null : { rating, signature: context.signature },
  };
  trackEvent("rating", isUndo ? "output_unrated" : "output_rated", {
    details: {
      ...context.properties,
      surface,
      rating,
      previous_rating: isUndo ? null : previousRating,
      config_signature: context.signature,
    },
  });
}
