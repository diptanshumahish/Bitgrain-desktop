import { useEffect } from "react";
import { advanceWelcome, leaveWelcome } from "../welcome-store";

const ADVANCE_KEYS = new Set([" ", "Enter", "ArrowRight"]);

const handleWelcomeKey = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    leaveWelcome("dismissed");
    return;
  }
  if (!ADVANCE_KEYS.has(event.key) || event.target instanceof HTMLButtonElement) return;
  event.preventDefault();
  advanceWelcome();
};

export const useWelcomeKeys = (active: boolean): void => {
  useEffect(() => {
    if (!active) return;
    window.addEventListener("keydown", handleWelcomeKey);
    return () => window.removeEventListener("keydown", handleWelcomeKey);
  }, [active]);
};
