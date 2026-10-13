import { CopyPlus, FlipHorizontal2, FlipVertical2, Group, Lock, PenLine, Trash2, Ungroup, Unlock } from "lucide-react";
import type { Layer } from "../../../data/studioTypes";
import { emitContextMenu, type ContextMenuAction } from "../../../lib/event-bus";

interface ContextMenuConfig {
  layers: Layer[];
  activeIds: string[];
  onRename: (id: string) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicate: (ids: string[]) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
}

export const buildLayerContextActions = ({
  layers,
  activeIds,
  onRename,
  onGroup,
  onUngroup,
  onDuplicate,
  onUpdateLayer,
  onDeleteLayer,
}: ContextMenuConfig): ContextMenuAction[] => {
  const singleLayer = layers.find((l) => l.id === activeIds[0]);
  const isGroup = activeIds.length === 1 && singleLayer?.type === "group";

  return [
    {
      label: "Rename",
      icon: PenLine,
      onClick: () => onRename(activeIds[0]),
      disabled: activeIds.length !== 1,
    },
    {
      label: activeIds.length > 1 ? `Group ${activeIds.length} layers` : "Group",
      icon: Group,
      onClick: onGroup,
      disabled: activeIds.length < 2,
    },
    {
      label: "Ungroup",
      icon: Ungroup,
      onClick: onUngroup,
      disabled: !isGroup,
    },
    {
      label: "Duplicate",
      icon: CopyPlus,
      onClick: () => onDuplicate(activeIds),
    },
    {
      label: singleLayer?.locked ? "Unlock" : "Lock",
      icon: singleLayer?.locked ? Unlock : Lock,
      onClick: () =>
        activeIds.forEach((lid) => {
          const target = layers.find((l) => l.id === lid);
          if (target) onUpdateLayer(lid, { locked: !target.locked });
        }),
    },
    {
      label: "Flip horizontal",
      icon: FlipHorizontal2,
      onClick: () =>
        activeIds.forEach((lid) => {
          const target = layers.find((l) => l.id === lid);
          if (target) onUpdateLayer(lid, { flipH: !target.flipH });
        }),
    },
    {
      label: "Flip vertical",
      icon: FlipVertical2,
      onClick: () =>
        activeIds.forEach((lid) => {
          const target = layers.find((l) => l.id === lid);
          if (target) onUpdateLayer(lid, { flipV: !target.flipV });
        }),
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      dividerBefore: true,
      onClick: () => activeIds.forEach((lid) => onDeleteLayer(lid)),
    },
  ];
};

export const emitLayerContextMenu = (
  event: React.MouseEvent,
  config: ContextMenuConfig,
): void => {
  event.preventDefault();
  emitContextMenu({
    x: event.clientX,
    y: event.clientY,
    actions: buildLayerContextActions(config),
  });
};
