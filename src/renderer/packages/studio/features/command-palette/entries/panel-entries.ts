import { showLeftPanelTab } from "../../../state/studio-panels-store";
import { emitOpenElementLibrary } from "../../elements/library/element-library-events";
import { emitOpenFindReplace } from "../../../find-replace/find-replace-events";
import { openSlideSorter } from "../../presenter/sorter/state/slide-sorter-store";
import { emitVersionCommand } from "../../versions/version-events";
import { requestCanvasFit, requestCanvasZoom } from "../../../state/canvas-fit-request";
import { toggleGuides, toggleRulers } from "../../../state/canvas-aids/canvas-aids-visibility";
import { toggleTheme } from "@bitgrain/ui/theme/global-theme-store";
import { MOD_KEY } from "../../../editor/shortcut-labels";
import type { PaletteEntry } from "./palette-entry";

const ACTUAL_SIZE_ZOOM = 1;

export const PANEL_ENTRIES: PaletteEntry[] = [
  { id: "panel-templates", label: "Browse templates", group: "Panels", keywords: ["template", "designs", "starter", "layout", "library", "ready made", "premade", "examples", "inspiration", "start from", "poster", "flyer", "resume", "deck"], hint: "They adapt to your canvas size", run: () => showLeftPanelTab("templates") },
  { id: "panel-layers", label: "Show layers", group: "Panels", keywords: ["layer list", "order", "stack", "bring forward", "send back", "hidden", "lock", "rename"], run: () => showLeftPanelTab("layers") },
  { id: "panel-elements", label: "Elements library", group: "Panels", keywords: ["graphics", "icons", "stickers", "illustrations", "assets", "clipart", "decorations", "badges", "arrows", "frames"], run: () => emitOpenElementLibrary() },
  { id: "panel-find", label: "Find and replace text", group: "Panels", keywords: ["search", "replace", "words", "change word", "spelling", "typo"], shortcut: `${MOD_KEY}F`, run: () => emitOpenFindReplace() },
  { id: "panel-sorter", label: "Page sorter", group: "Panels", keywords: ["slides", "reorder pages", "overview", "all pages", "rearrange", "move page"], shortcut: "G", run: () => openSlideSorter() },
  { id: "panel-versions", label: "Version history", group: "Panels", keywords: ["restore", "backup", "history", "checkpoint", "older version", "lost work", "go back in time", "recover"], run: () => emitVersionCommand("history") },
  { id: "view-fit", label: "Zoom to fit", group: "View", keywords: ["zoom", "fit screen", "whole page", "see everything", "zoom out", "center"], shortcut: `${MOD_KEY}0`, run: () => requestCanvasFit() },
  { id: "view-actual", label: "Zoom to 100%", group: "View", keywords: ["zoom", "actual size", "pixels", "real size", "zoom in", "100"], shortcut: `${MOD_KEY}1`, run: () => requestCanvasZoom(ACTUAL_SIZE_ZOOM) },
  { id: "view-rulers", label: "Show or hide rulers", group: "View", keywords: ["measure", "ruler", "measurements", "inches", "spacing"], shortcut: "⇧ R", run: () => toggleRulers() },
  { id: "view-guides", label: "Show or hide guides", group: "View", keywords: ["guides", "snap", "lines", "align", "grid lines"], shortcut: `${MOD_KEY};`, run: () => toggleGuides() },
  { id: "view-theme", label: "Switch light or dark theme", group: "View", keywords: ["dark mode", "light mode", "appearance", "night", "eyes", "brightness"], run: () => toggleTheme() },
];
