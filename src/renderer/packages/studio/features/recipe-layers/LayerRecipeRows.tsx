import React from "react";
import { Plus, X } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { imageLayerSteps, isPhotoLayer, type LayerRecipeStep } from "./image-layer-steps";
import { scrollToPanelAnchor } from "./scroll-to-panel-anchor";

interface LayerRecipeRowsProps {
  layer: Layer;
  active: boolean;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
}

interface StepRowProps {
  step: LayerRecipeStep;
  onRemove: () => void;
}

const ROW_CLASS = "flex items-center gap-2 h-7 pl-10 pr-1.5 rounded-sm text-[12px] transition-colors";

const StepRow: React.FC<StepRowProps> = ({ step, onRemove }) => (
  <div className={`group ${ROW_CLASS} text-[var(--s-text)] hover:bg-[var(--s-bg-input)]`}>
    <button type="button" onClick={() => scrollToPanelAnchor(step.anchor)} className="flex-1 min-w-0 flex items-baseline gap-1.5 text-left">
      <span className="font-medium truncate">{step.title}</span>
      <span className="text-[var(--s-text-muted)] shrink-0">{step.detail}</span>
    </button>
    <button type="button" onClick={onRemove} aria-label={`Remove ${step.title}`}
      className="w-6 h-6 flex items-center justify-center rounded text-[var(--s-text-muted)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--s-text)]">
      <X size={12} strokeWidth={1.75} />
    </button>
  </div>
);

export const LayerRecipeRows: React.FC<LayerRecipeRowsProps> = ({ layer, active, onUpdateLayer }) => {
  if (!active || !isPhotoLayer(layer)) return null;
  const steps = imageLayerSteps(layer);
  const remove = (step: LayerRecipeStep): void => {
    onUpdateLayer(layer.id, step.clear);
    trackEvent("studio", "layer_recipe_step_removed", { details: { step: step.id } });
  };
  return (
    <div className="flex flex-col mt-0.5">
      {steps.map((step) => <StepRow key={step.id} step={step} onRemove={() => remove(step)} />)}
      <button type="button" onClick={() => scrollToPanelAnchor("look")}
        className={`${ROW_CLASS} text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]`}>
        <Plus size={12} strokeWidth={2} />
        Add step
      </button>
    </div>
  );
};
