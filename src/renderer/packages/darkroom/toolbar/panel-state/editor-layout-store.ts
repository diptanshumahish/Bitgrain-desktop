import { signal, useSignalValue } from "@bitgrain/core/signal";

type EditorLayout = "phone" | "inspector" | "recipe";

const PHONE_QUERY = "(max-width: 767px)";
const RECIPE_QUERY = "(min-width: 1024px)";

const canMatchMedia = (): boolean => typeof window !== "undefined" && typeof window.matchMedia === "function";

const readLayout = (): EditorLayout => {
  if (!canMatchMedia()) return "inspector";
  if (window.matchMedia(PHONE_QUERY).matches) return "phone";
  return window.matchMedia(RECIPE_QUERY).matches ? "recipe" : "inspector";
};

export const editorLayoutSignal = signal<EditorLayout>(readLayout());

const syncLayout = (): void => {
  editorLayoutSignal.value = readLayout();
};

if (canMatchMedia()) {
  window.matchMedia(PHONE_QUERY).addEventListener("change", syncLayout);
  window.matchMedia(RECIPE_QUERY).addEventListener("change", syncLayout);
}

export const useEditorLayout = (): EditorLayout => useSignalValue(editorLayoutSignal);
