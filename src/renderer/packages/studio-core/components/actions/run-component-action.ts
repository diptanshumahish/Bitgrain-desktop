import { detachInstance, resetOverrides, setInstanceResize, swapInstance } from "../ops/instance-ops";
import { addVariant } from "../ops/variant-ops";
import { addVariantProperty, renameComponentSet, renameVariantProperty, setVariantValue } from "../ops/variant-props";
import type { ComponentAction } from "../events/component-events";
import type { ComponentActionContext, ComponentActionOutcome } from "./component-action-context";
import { runCreate, runGoToMain, runInsert, runPickVariant } from "./instance-actions";

const runAddVariant = (context: ComponentActionContext, layerId: string): ComponentActionOutcome => {
  const added = addVariant(context.pages, layerId);
  if (!added) return { failure: "Pick a main component to add a variant to it." };
  return { pages: added.pages, selectIds: [added.layerId] };
};

const pagesOnly = (pages: ComponentActionContext["pages"]): ComponentActionOutcome => ({ pages });

export const runComponentAction = (action: ComponentAction, context: ComponentActionContext): ComponentActionOutcome => {
  const { pages } = context;
  switch (action.kind) {
    case "create": return runCreate(context);
    case "insert": return runInsert(context, action.componentId, action.drop);
    case "go-to-main": return runGoToMain(context, action.componentId);
    case "pick-variant": return runPickVariant(context, action.layerId, action.property, action.value);
    case "add-variant": return runAddVariant(context, action.layerId);
    case "detach": return { pages: detachInstance(pages, action.layerId), selectIds: [action.layerId] };
    case "reset": return pagesOnly(resetOverrides(pages, action.layerId, action.overrideKey));
    case "swap": return pagesOnly(swapInstance(pages, action.layerId, action.componentId));
    case "set-resize": return pagesOnly(setInstanceResize(pages, action.layerId, action.resize));
    case "set-variant-value": return pagesOnly(setVariantValue(pages, action.componentId, action.property, action.value));
    case "rename-property": return pagesOnly(renameVariantProperty(pages, action.setId, action.from, action.to));
    case "add-property": return pagesOnly(addVariantProperty(pages, action.setId, action.name));
    case "rename-set": return pagesOnly(renameComponentSet(pages, action.setId, action.name));
  }
};
