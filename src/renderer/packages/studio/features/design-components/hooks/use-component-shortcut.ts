import { useEffect } from "react";
import { emitComponentAction } from "@bitgrain/studio-core/components/events/component-events";

const CREATE_COMPONENT_CODE = "KeyK";
const EDITABLE_SELECTOR = "input, textarea, [contenteditable]";

const isCreateComponentKey = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && event.altKey && !event.shiftKey && event.code === CREATE_COMPONENT_CODE;

const isTypingTarget = (event: KeyboardEvent): boolean =>
  Boolean((event.target as HTMLElement | null)?.closest(EDITABLE_SELECTOR));

export const useComponentShortcut = (): void => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (!isCreateComponentKey(event) || isTypingTarget(event)) return;
      event.preventDefault();
      emitComponentAction({ kind: "create" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
};
