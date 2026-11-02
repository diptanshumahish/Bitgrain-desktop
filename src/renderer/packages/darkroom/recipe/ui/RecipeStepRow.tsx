import React, { memo } from "react";
import { Aperture, Blend, Film, Newspaper, Palette, SlidersHorizontal, X } from "lucide-react";
import type { RecipeStep, RecipeStepKind } from "../recipe-types";

const ICON_SIZE = 15;

const STEP_ICONS: Record<RecipeStepKind, React.ReactNode> = {
  adjust: <SlidersHorizontal size={ICON_SIZE} strokeWidth={1.75} />,
  look: <Aperture size={ICON_SIZE} strokeWidth={1.75} />,
  effect: <Blend size={ICON_SIZE} strokeWidth={1.75} />,
  colour: <Palette size={ICON_SIZE} strokeWidth={1.75} />,
  grade: <Film size={ICON_SIZE} strokeWidth={1.75} />,
  finish: <Newspaper size={ICON_SIZE} strokeWidth={1.75} />,
};

const ROW_SELECTED = "bg-[var(--s-bg-input)] ring-1 ring-inset ring-[var(--s-border-selected)]";
const ROW_IDLE = "hover:bg-[var(--s-bg-input)]";

interface RecipeStepRowProps {
  step: RecipeStep;
  position: number;
  selected: boolean;
  onSelect: (step: RecipeStep) => void;
  onRemove: (step: RecipeStep) => void;
}

const sameStep = (previous: RecipeStep, next: RecipeStep): boolean =>
  previous.id === next.id && previous.kind === next.kind && previous.title === next.title
  && previous.detail === next.detail && previous.panel === next.panel && previous.effectKey === next.effectKey;

const sameRowProps = (previous: RecipeStepRowProps, next: RecipeStepRowProps): boolean =>
  sameStep(previous.step, next.step) && previous.position === next.position && previous.selected === next.selected
  && previous.onSelect === next.onSelect && previous.onRemove === next.onRemove;

const RecipeStepRowView: React.FC<RecipeStepRowProps> = ({ step, position, selected, onSelect, onRemove }) => (
  <div className={`group relative flex items-center rounded-lg transition-colors ${selected ? ROW_SELECTED : ROW_IDLE}`}>
    <button type="button" onClick={() => onSelect(step)} disabled={!step.panel} aria-current={selected ? "step" : undefined}
      className="flex-1 min-w-0 grid grid-cols-[16px_32px_minmax(0,1fr)] items-center gap-2.5 py-2 pl-2.5 pr-9 text-left disabled:cursor-default">
      <span className="text-[12px] text-[var(--s-text-muted)] [font-variant-numeric:tabular-nums]">{position}</span>
      <span className="w-8 h-8 rounded-md border border-[var(--s-border)] bg-[var(--s-bg-panel)] flex items-center justify-center text-[var(--s-text-muted)]">
        {STEP_ICONS[step.kind]}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[var(--s-text)] truncate">{step.title}</span>
        <span className="block text-[12px] text-[var(--s-text-muted)] truncate">{step.detail}</span>
      </span>
    </button>
    <button type="button" onClick={() => onRemove(step)} aria-label={`Remove ${step.title}`}
      className="absolute right-1.5 w-7 h-7 flex items-center justify-center rounded-md text-[var(--s-text-muted)] opacity-60 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--s-text)] hover:bg-[var(--s-bg-panel)] transition">
      <X size={14} strokeWidth={1.75} />
    </button>
  </div>
);

export const RecipeStepRow = memo(RecipeStepRowView, sameRowProps);
