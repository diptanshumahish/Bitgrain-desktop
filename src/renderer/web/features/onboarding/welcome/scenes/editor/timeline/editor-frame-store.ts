import { signal } from "@bitgrain/core/signal";

type EditorPhoto = "original" | "swapped";
export type EditorPalette = "primaries" | "cobalt";
export type EditorSelection = "template" | "headline" | "photo" | "palette" | "export" | null;

export interface EditorFrame {
  loaded: boolean;
  selection: EditorSelection;
  typedLetters: number | null;
  photo: EditorPhoto;
  dragging: boolean;
  palette: EditorPalette;
  exported: boolean;
  step: number;
}

export const INITIAL_EDITOR_FRAME: EditorFrame = {
  loaded: false,
  selection: null,
  typedLetters: null,
  photo: "original",
  dragging: false,
  palette: "primaries",
  exported: false,
  step: 0,
};

export const editorFrameSignal = signal<EditorFrame>(INITIAL_EDITOR_FRAME);

export function patchEditorFrame(patch: Partial<EditorFrame>): void {
  editorFrameSignal.value = { ...editorFrameSignal.value, ...patch };
}

export function resetEditorFrame(): void {
  editorFrameSignal.value = INITIAL_EDITOR_FRAME;
}
