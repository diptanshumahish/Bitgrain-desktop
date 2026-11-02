import { Component, CopyPlus, Diamond, RotateCcw, Unlink } from "lucide-react";
import type { ContextMenuAction } from "@bitgrain/ui/overlays/context-menu-events";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { MOD_ALT_KEY } from "../../../editor/shortcut-labels";
import { emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";
import { findInstanceAncestor } from "@bitgrain/studio-core/components/tree/layer-walk";

const instanceActions = (instance: Layer): ContextMenuAction[] => {
  const meta = instance.instance;
  if (!meta) return [];
  return [
    {
      label: "Go to main component", icon: Diamond, dividerBefore: true,
      onClick: () => emitComponentAction({ kind: "go-to-main", componentId: meta.componentId }),
    },
    {
      label: "Reset all overrides", icon: RotateCcw,
      disabled: Object.keys(meta.overrides ?? {}).length === 0,
      onClick: () => emitComponentAction({ kind: "reset", layerId: instance.id }),
    },
    { label: "Detach instance", icon: Unlink, onClick: () => emitComponentAction({ kind: "detach", layerId: instance.id }) },
  ];
};

const mainActions = (main: Layer): ContextMenuAction[] => [
  {
    label: "Add variant", icon: CopyPlus, dividerBefore: true,
    onClick: () => emitComponentAction({ kind: "add-variant", layerId: main.id }),
  },
];

const createAction: ContextMenuAction = {
  label: "Create component", icon: Component, shortcut: `${MOD_ALT_KEY}K`, dividerBefore: true,
  onClick: () => emitComponentAction({ kind: "create" }),
};

export const componentMenuActions = (layers: Layer[], activeIds: string[], target: Layer | undefined): ContextMenuAction[] => {
  if (!target) return [];
  const instance = activeIds.length === 1 ? findInstanceAncestor(layers, target.id) : null;
  if (instance) return instanceActions(instance);
  if (activeIds.length === 1 && target.component) return mainActions(target);
  return [createAction];
};
