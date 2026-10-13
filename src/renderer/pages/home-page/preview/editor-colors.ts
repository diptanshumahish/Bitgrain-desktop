import { paperColorSignal } from "../../../store/transform-store";

export const EDITOR_BG_COLOR = "#fdf6e3";
export const PREVIEW_FG_COLOR = "#000000";

export const editorPaperColor = (): string => paperColorSignal.value ?? EDITOR_BG_COLOR;
