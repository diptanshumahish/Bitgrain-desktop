import React from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import type { TutorialStep } from "../../data/tutorial-steps";

interface TutorialTooltipProps {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}) => (
  <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 w-72 font-editorial">
    <button
      onClick={onSkip}
      className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      aria-label="Skip tutorial"
    >
      <X size={14} />
    </button>

    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[9px] font-bold text-[var(--s-accent)]     ">
          {stepIndex + 1} / {totalSteps}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === stepIndex
                  ? "w-4 bg-[var(--s-accent)]"
                  : i < stepIndex
                    ? "w-1 bg-[var(--s-accent)]/60"
                    : "w-1 bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight pr-5">
        {step.title}
      </h3>
    </div>

    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
      {step.description}
    </p>

    <div className="flex items-center justify-between">
      {!isFirst ? (
        <button
          onClick={onPrev}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft size={12} />
          Back
        </button>
      ) : (
        <button
          onClick={onSkip}
          className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          Skip
        </button>
      )}
      <button
        onClick={onNext}
        className="flex items-center gap-1.5 bg-[var(--s-accent)] hover:bg-[var(--brand-primary)] text-[var(--s-accent-text)] text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors active:scale-95"
      >
        {isLast ? "Done" : "Next"}
        {!isLast && <ArrowRight size={12} />}
      </button>
    </div>
  </div>
);
