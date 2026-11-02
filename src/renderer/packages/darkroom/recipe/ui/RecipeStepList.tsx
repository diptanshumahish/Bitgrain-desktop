import React, { memo } from "react";
import { ImageIcon } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageMetaSignal, isSampleSignal } from "../../state/image-store";
import { removeRecipeStep } from "../remove-recipe-step";
import type { RecipeStep } from "../recipe-types";
import { RecipeStepRow } from "./RecipeStepRow";

const SAMPLE_NAME = "Sample image";
const FIRST_STEP_POSITION = 2;

interface RecipeStepListProps {
  steps: RecipeStep[];
  isSelected: (step: RecipeStep) => boolean;
  onSelect: (step: RecipeStep) => void;
  addStep: React.ReactNode;
}

const PhotoRowView: React.FC = () => {
  const meta = useSignalValue(imageMetaSignal);
  const isSample = useSignalValue(isSampleSignal);
  return (
    <div className="grid grid-cols-[16px_32px_minmax(0,1fr)] items-center gap-2.5 py-2 px-2.5">
      <span className="text-[12px] text-[var(--s-text-muted)]">1</span>
      <span className="w-8 h-8 rounded-md border border-[var(--s-border)] flex items-center justify-center text-[var(--s-text-muted)]">
        <ImageIcon size={15} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[var(--s-text)]">Photo</span>
        <span className="block text-[12px] text-[var(--s-text-muted)] truncate">{isSample ? SAMPLE_NAME : meta?.name ?? SAMPLE_NAME}</span>
      </span>
    </div>
  );
};

const PhotoRow = memo(PhotoRowView);

export const RecipeStepList: React.FC<RecipeStepListProps> = ({ steps, isSelected, onSelect, addStep }) => (
  <div className="flex flex-col gap-1">
    <PhotoRow />
    {steps.map((step, index) => (
      <RecipeStepRow key={step.id} step={step} position={index + FIRST_STEP_POSITION}
        selected={isSelected(step)} onSelect={onSelect} onRemove={removeRecipeStep} />
    ))}
    <div className="pt-2">{addStep}</div>
  </div>
);
