import React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import { activeRatingFor, rateOutput, ratingVotesSignal } from "./rating-store";
import type { RatingContext, RatingSurface, RatingValue } from "./rating-types";

const ICON_SIZE = 13;
const ICON_STROKE = 1.75;

interface OutputRatingButtonsProps {
  surface: RatingSurface;
  getContext: () => RatingContext;
  className?: string;
}

interface RatingButtonProps {
  value: RatingValue;
  active: boolean;
  onRate: (value: RatingValue) => void;
}

const BUTTON_LABELS: Record<RatingValue, string> = {
  up: "I like this result",
  down: "I don't like this result",
};

const RatingButton = ({ value, active, onRate }: RatingButtonProps): React.ReactElement => {
  const Icon = value === "up" ? ThumbsUp : ThumbsDown;
  return (
    <button
      type="button"
      onClick={() => onRate(value)}
      aria-label={BUTTON_LABELS[value]}
      aria-pressed={active}
      title={BUTTON_LABELS[value]}
      className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors active:scale-95 ${
        active
          ? "bg-[var(--s-text)] text-[var(--s-bg-panel)]"
          : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]"
      }`}
    >
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} fill={active ? "currentColor" : "none"} />
    </button>
  );
};

export const OutputRatingButtons = ({
  surface,
  getContext,
  className = "",
}: OutputRatingButtonsProps): React.ReactElement => {
  const votes = useSignalValue(ratingVotesSignal);
  const context = getContext();
  const activeRating = activeRatingFor(votes, surface, context.signature);
  const handleRate = (value: RatingValue): void => rateOutput(surface, value, getContext());

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-[11px] text-[var(--s-text-muted)] pr-0.5">
        {activeRating ? "Thanks for the feedback" : "Liking this?"}
      </span>
      <RatingButton value="up" active={activeRating === "up"} onRate={handleRate} />
      <RatingButton value="down" active={activeRating === "down"} onRate={handleRate} />
    </div>
  );
};
