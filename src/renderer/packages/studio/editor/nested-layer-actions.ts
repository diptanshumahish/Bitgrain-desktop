import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, CopyPlus, MousePointerSquareDashed } from "lucide-react";
import type { ContextMenuAction } from "@bitgrain/ui/overlays/context-menu-events";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { updateLayersRecursively, isContainerLayer } from "@bitgrain/studio-core/layers/studio-layers";
import { trackEvent } from "@bitgrain/platform/tracker";
import { moveToBack, moveToFront, shiftLayers } from "@bitgrain/studio-core/layers/layer-order";
import { MOD_KEY } from "./shortcut-labels";

export interface NestedMenuContext {
  parentId: string;
  activeIds: string[];
  activeLayers: Layer[];
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
  handleDuplicate: (ids: string[]) => void;
}

const tracked = (action: string, handler: () => void) => (): void => {
  trackEvent("studio", "context_menu_action", { details: { action, nested: true } });
  handler();
};

const updateParentChildren = (ctx: NestedMenuContext, reorder: (children: Layer[]) => Layer[]): void => {
  ctx.pushHistory();
  ctx.setLayers((prev) =>
    updateLayersRecursively(prev, [ctx.parentId], (parent) =>
      isContainerLayer(parent) ? { layers: reorder(parent.layers) } : {},
    ),
  );
};

export const selectParentAction = (ctx: NestedMenuContext): ContextMenuAction => ({
  label: "Select parent group",
  icon: MousePointerSquareDashed,
  shortcut: "Esc",
  onClick: tracked("select_parent", () => ctx.setSelectedIds([ctx.parentId])),
});

export const nestedDuplicateAction = (ctx: NestedMenuContext): ContextMenuAction => ({
  label: "Duplicate",
  icon: CopyPlus,
  shortcut: `${MOD_KEY}D`,
  onClick: tracked("duplicate", () => ctx.handleDuplicate(ctx.activeIds)),
});

export const nestedArrangeActions = (ctx: NestedMenuContext): ContextMenuAction[] => [
  {
    label: "Bring forward", icon: ArrowUp, shortcut: "]", dividerBefore: true,
    onClick: tracked("bring_forward", () => updateParentChildren(ctx, (children) => shiftLayers(children, ctx.activeIds, 1))),
  },
  {
    label: "Send backward", icon: ArrowDown, shortcut: "[",
    onClick: tracked("send_backward", () => updateParentChildren(ctx, (children) => shiftLayers(children, ctx.activeIds, -1))),
  },
  {
    label: "Bring to front", icon: ArrowUpToLine, shortcut: `${MOD_KEY}]`,
    onClick: tracked("bring_to_front", () => updateParentChildren(ctx, (children) => moveToFront(children, ctx.activeIds))),
  },
  {
    label: "Send to back", icon: ArrowDownToLine, shortcut: `${MOD_KEY}[`,
    onClick: tracked("send_to_back", () => updateParentChildren(ctx, (children) => moveToBack(children, ctx.activeIds))),
  },
];
