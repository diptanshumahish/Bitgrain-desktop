import type React from "react";
import { useRef } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";

interface ContainerLike {
  id: string;
  layers: Layer[];
}

interface GroupSelectionOptions {
  layer: ContainerLike;
  selectedIds: string[];
  onSelect: (id: string, multi?: boolean) => void;
  onSelectSelf: (multi?: boolean) => void;
  onSelfContextMenu?: (e: React.MouseEvent) => void;
  onLayerContextMenu?: (id: string, x: number, y: number) => void;
}

interface GroupSelection {
  isSelected: boolean;
  hasSelectedDescendant: boolean;
  notePress: () => void;
  drillIn: (multi: boolean) => boolean;
  selectChild: (childId: string, multi?: boolean) => void;
  isChildArmed: (childId: string) => boolean;
  openChildMenu: (childId: string, e: React.MouseEvent) => void;
}

type PressContext = "outside" | "self" | "inside";

interface LastChildClick {
  id: string;
  wasSelected: boolean;
}

export const useGroupSelection = ({
  layer,
  selectedIds,
  onSelect,
  onSelectSelf,
  onSelfContextMenu,
  onLayerContextMenu,
}: GroupSelectionOptions): GroupSelection => {
  const lastChildClickRef = useRef<LastChildClick | null>(null);
  const contextAtPressRef = useRef<PressContext | null>(null);
  const isSelected = selectedIds.includes(layer.id);
  const hasSelectedDescendant = selectedIds.some((id) => findLayerById(layer.layers, id) !== null);
  const currentContext: PressContext = hasSelectedDescendant ? "inside" : isSelected ? "self" : "outside";

  const notePress = (): void => {
    contextAtPressRef.current = currentContext;
  };

  const selectChild = (childId: string, multi?: boolean): void => {
    const wasSelected = selectedIds.includes(childId);
    const context = contextAtPressRef.current ?? currentContext;
    contextAtPressRef.current = null;
    lastChildClickRef.current = { id: childId, wasSelected };
    if (wasSelected && !multi) return;
    if (context === "inside") onSelect(childId, multi);
    else if (context === "outside" || multi) onSelectSelf(multi);
  };

  const drillIn = (multi: boolean): boolean => {
    const last = lastChildClickRef.current;
    if (!isSelected || !last) return false;
    onSelect(last.id, multi);
    return true;
  };

  const isChildArmed = (childId: string): boolean => {
    const last = lastChildClickRef.current;
    return last?.id === childId && last.wasSelected;
  };

  const openChildMenu = (childId: string, e: React.MouseEvent): void => {
    const targetsChild = selectedIds.includes(childId) || hasSelectedDescendant;
    if (targetsChild) onLayerContextMenu?.(childId, e.clientX, e.clientY);
    else onSelfContextMenu?.(e);
  };

  return { isSelected, hasSelectedDescendant, notePress, drillIn, selectChild, isChildArmed, openChildMenu };
};
