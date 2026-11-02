import { collectComponents, componentSetOf } from "../registry/collect-components";
import { pickVariant } from "../registry/variant-pick";
import { createComponent } from "../ops/create-component";
import { insertInstance } from "../ops/insert-instance";
import { swapInstance } from "../ops/instance-ops";
import { locateInPages } from "../tree/layer-walk";
import type { ComponentDropPoint } from "../events/component-events";
import type { ComponentActionContext, ComponentActionOutcome } from "./component-action-context";

const HALF = 2;

export const runCreate = (context: ComponentActionContext): ComponentActionOutcome => {
  const created = createComponent(context.pages, context.activePageId, context.selectedIds);
  if (!created) return { failure: "Select a frame, a group or a few layers on this page to make a component." };
  return { pages: created.pages, selectIds: [created.layerId] };
};

export const runInsert = (context: ComponentActionContext, componentId: string, drop: ComponentDropPoint | null): ComponentActionOutcome => {
  const pageId = drop?.pageId ?? context.activePageId;
  const page = context.pages.find((entry) => entry.id === pageId);
  if (!page) return { failure: "There is no page to place this component on." };
  const center = drop ? { x: drop.x, y: drop.y } : { x: page.width / HALF, y: page.height / HALF };
  const inserted = insertInstance(context.pages, componentId, pageId, center);
  if (!inserted) return { failure: "That component is no longer in this document." };
  return { pages: inserted.pages, selectIds: [inserted.layerId], activePageId: pageId };
};

export const runGoToMain = (context: ComponentActionContext, componentId: string): ComponentActionOutcome => {
  const entry = collectComponents(context.pages).find((candidate) => candidate.id === componentId);
  if (!entry) return { failure: "The main component was deleted, detach this instance to keep editing it." };
  return { pages: context.pages, selectIds: [entry.layerId], activePageId: entry.pageId };
};

export const runPickVariant = (
  context: ComponentActionContext,
  layerId: string,
  property: string,
  value: string,
): ComponentActionOutcome => {
  const instance = locateInPages(context.pages, layerId)?.layer;
  const entries = collectComponents(context.pages);
  const current = entries.find((entry) => entry.id === instance?.instance?.componentId);
  const set = componentSetOf(entries, current?.setId);
  if (!instance || !current || !set) return { failure: "This instance has no variants to switch between." };
  const members = entries.filter((entry) => set.componentIds.includes(entry.id));
  const target = pickVariant(members, current.variant ?? {}, property, value);
  if (!target) return { failure: "No variant matches that choice." };
  return { pages: swapInstance(context.pages, layerId, target.id) };
};
