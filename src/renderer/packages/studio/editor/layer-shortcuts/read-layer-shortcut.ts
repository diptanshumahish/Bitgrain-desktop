import type { ArrangeKind } from "./arrange-in-parents";

export type LayerShortcut =
  | { kind: "arrange"; arrange: ArrangeKind }
  | { kind: "copy-style" }
  | { kind: "paste-style" }
  | { kind: "paste-in-place" }
  | { kind: "toggle-lock" }
  | { kind: "toggle-hide" }
  | { kind: "toggle-mask" }
  | { kind: "show-shortcuts" };

const readArrange = (event: KeyboardEvent, withModifier: boolean): LayerShortcut | null => {
  if (event.altKey || event.shiftKey) return null;
  if (event.code === "BracketRight") return { kind: "arrange", arrange: withModifier ? "front" : "forward" };
  if (event.code === "BracketLeft") return { kind: "arrange", arrange: withModifier ? "back" : "backward" };
  return null;
};

const readModified = (event: KeyboardEvent): LayerShortcut | null => {
  if (event.altKey && !event.shiftKey && event.code === "KeyC") return { kind: "copy-style" };
  if (event.altKey && !event.shiftKey && event.code === "KeyV") return { kind: "paste-style" };
  if (event.altKey && !event.shiftKey && event.code === "KeyM") return { kind: "toggle-mask" };
  if (event.altKey || !event.shiftKey) return null;
  if (event.code === "KeyV") return { kind: "paste-in-place" };
  if (event.code === "KeyL") return { kind: "toggle-lock" };
  if (event.code === "KeyH") return { kind: "toggle-hide" };
  return null;
};

export const readLayerShortcut = (event: KeyboardEvent): LayerShortcut | null => {
  const withModifier = event.metaKey || event.ctrlKey;
  const arrange = readArrange(event, withModifier);
  if (arrange) return arrange;
  if (withModifier) return readModified(event);
  if (event.key === "?" && !event.altKey) return { kind: "show-shortcuts" };
  return null;
};
