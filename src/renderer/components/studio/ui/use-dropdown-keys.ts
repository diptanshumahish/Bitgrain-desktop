import type React from "react";

interface DropdownKeysOptions {
  open: boolean;
  count: number;
  activeIndex: number;
  onOpen: () => void;
  onHighlight: (index: number) => void;
  onSelectActive: () => void;
  onClose: () => void;
}

const nextIndex = (key: string, activeIndex: number, count: number): number | null => {
  if (key === "ArrowDown") return Math.min(count - 1, activeIndex + 1);
  if (key === "ArrowUp") return Math.max(0, activeIndex - 1);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
};

const handleClosedKey = (event: React.KeyboardEvent, onOpen: () => void): void => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  onOpen();
};

export function useDropdownKeys(options: DropdownKeysOptions): (event: React.KeyboardEvent) => void {
  const { open, count, activeIndex, onOpen, onHighlight, onSelectActive, onClose } = options;
  return (event: React.KeyboardEvent) => {
    if (!open) {
      handleClosedKey(event, onOpen);
      return;
    }
    if (event.key === "Escape" || event.key === "Tab") {
      if (event.key === "Escape") event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0) onSelectActive();
      return;
    }
    const index = count > 0 ? nextIndex(event.key, activeIndex, count) : null;
    if (index === null) return;
    event.preventDefault();
    onHighlight(index);
  };
}
