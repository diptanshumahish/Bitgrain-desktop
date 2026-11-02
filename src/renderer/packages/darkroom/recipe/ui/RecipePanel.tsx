import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { SECTION_TITLE_CLASS } from "@bitgrain/ui/components/section-title-classes";
import { resolveInspectorPanel } from "../../toolbar/inspector/resolve-panel";
import type { ActivePopover } from "../../toolbar/toolbar-types";
import { useRecipe } from "../use-recipe";
import { isRecipeStepSelected, openPresets, selectRecipeStep, selectedEffectKeySignal } from "../recipe-selection";
import { Button } from "@bitgrain/ui/components/Button";
import { RecipeStepList } from "./RecipeStepList";
import { AddStepButton } from "./AddStepButton";
import { RecipeFooter } from "./RecipeFooter";

interface RecipePanelProps {
  active: ActivePopover;
}

export const RecipePanel: React.FC<RecipePanelProps> = ({ active }) => {
  const steps = useRecipe();
  const effectKey = useSignalValue(selectedEffectKeySignal);
  const panel = resolveInspectorPanel(active);
  return (
    <aside aria-label="Recipe" className="flex w-[264px] shrink-0 flex-col bg-[var(--s-bg-panel)] border-r border-[var(--s-border)] font-editorial">
      <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-[var(--s-border)]">
        <h2 className={SECTION_TITLE_CLASS}>Recipe</h2>
        <Button variant="secondary" size="xs" onClick={openPresets}>
          Save as preset
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2">
        <RecipeStepList steps={steps} isSelected={(step) => isRecipeStepSelected(step, panel, effectKey)}
          onSelect={selectRecipeStep} addStep={<AddStepButton />} />
      </div>
      <RecipeFooter />
    </aside>
  );
};
