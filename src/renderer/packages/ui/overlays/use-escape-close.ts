import { useEffect } from "react";

export function useEscapeClose(enabled: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!enabled) return undefined;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [enabled, onClose]);
}
