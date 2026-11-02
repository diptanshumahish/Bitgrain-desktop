type SelectionMode = "single" | "toggle" | "range";

interface SelectionClick {
  current: string[];
  clickedId: string;
  anchorId: string | null;
  orderedPageIds: string[];
  mode: SelectionMode;
}

const rangeBetween = (orderedPageIds: string[], fromId: string, toId: string): string[] => {
  const fromIndex = orderedPageIds.indexOf(fromId);
  const toIndex = orderedPageIds.indexOf(toId);
  if (fromIndex < 0 || toIndex < 0) return [toId];
  const [start, end] = fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex];
  return orderedPageIds.slice(start, end + 1);
};

export const nextSelection = ({ current, clickedId, anchorId, orderedPageIds, mode }: SelectionClick): string[] => {
  if (mode === "range" && anchorId) return rangeBetween(orderedPageIds, anchorId, clickedId);
  if (mode === "toggle") {
    return current.includes(clickedId) ? current.filter((id) => id !== clickedId) : [...current, clickedId];
  }
  return [clickedId];
};

interface ModifierState {
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

export const selectionModeOf = (event: ModifierState): SelectionMode => {
  if (event.shiftKey) return "range";
  if (event.metaKey || event.ctrlKey) return "toggle";
  return "single";
};
