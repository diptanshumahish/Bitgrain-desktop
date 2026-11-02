import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import { useRecipe } from "../use-recipe";
import { RecipeStepList } from "../ui/RecipeStepList";
import { RecipeFooter } from "../ui/RecipeFooter";
import { openMobileRecipeStep, openRecipeSheet } from "./mobile-step-panel";

const noneSelected = (): boolean => false;

const addStepButton = (
  <Button variant="secondary" size="lg" fullWidth leftIcon={<Plus size={15} strokeWidth={2} />} onClick={() => openRecipeSheet("recipe-add")}>
    Add step
  </Button>
);

export const MobileRecipeSheet: React.FC = () => (
  <div className="flex flex-col">
    <div className="p-2">
      <RecipeStepList steps={useRecipe()} isSelected={noneSelected} onSelect={openMobileRecipeStep} addStep={addStepButton} />
    </div>
    <RecipeFooter />
  </div>
);
