const EDITABLE_SELECTOR = "input, textarea, select, [contenteditable='true']";

export const isFileDrag = (event: DragEvent): boolean =>
  Array.from(event.dataTransfer?.types ?? []).includes("Files");

export const firstDroppedFile = (event: DragEvent): File | null =>
  event.dataTransfer?.files?.[0] ?? null;

export const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null;

export const firstPastedImage = (event: ClipboardEvent): File | null => {
  const items = Array.from(event.clipboardData?.items ?? []);
  const imageItem = items.find((item) => item.kind === "file" && item.type.startsWith("image/"));
  return imageItem?.getAsFile() ?? null;
};
