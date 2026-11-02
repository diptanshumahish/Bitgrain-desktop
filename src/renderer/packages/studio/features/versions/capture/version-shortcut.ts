const isTypingTarget = (target: EventTarget | null): boolean =>
  !!(target as HTMLElement | null)?.closest?.("input, textarea, [contenteditable]");

export const isSaveVersionShortcut = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && event.altKey && !event.shiftKey && event.code === "KeyS" &&
  !isTypingTarget(event.target);
