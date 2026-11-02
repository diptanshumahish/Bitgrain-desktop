import { emitStudioCommand, type StudioCommand } from "../../../editor/studio-command-event";
import { MOD_KEY, MOD_SHIFT_KEY } from "../../../editor/shortcut-labels";
import type { PaletteEntry, PaletteGroup } from "./palette-entry";

interface CommandSpec {
  command: StudioCommand;
  label: string;
  group: PaletteGroup;
  keywords: string[];
  shortcut?: string;
  hint?: string;
}

const COMMAND_SPECS: CommandSpec[] = [
  { command: "add-text", label: "Add text", group: "Add", keywords: ["heading", "title", "type", "write", "caption", "text box", "paragraph", "quote", "words on the page"] },
  { command: "add-image", label: "Add image or photo", group: "Add", keywords: ["upload", "picture", "photo", "import", "my own photo", "from computer", "logo", "png", "jpg", "put a picture in"] },
  { command: "add-rect", label: "Add rectangle", group: "Add", keywords: ["shape", "box", "square", "block", "background box", "card", "banner strip", "button"] },
  { command: "add-circle", label: "Add circle", group: "Add", keywords: ["shape", "ellipse", "round", "dot", "oval", "badge", "bubble"] },
  { command: "add-line", label: "Add line", group: "Add", keywords: ["divider", "rule", "stroke", "separator", "underline", "horizontal line"] },
  { command: "add-adjustment", label: "Add adjustment layer", group: "Add", keywords: ["filter", "grade", "effect", "overlay", "whole design", "everything below", "color grade", "tint everything"], hint: "Applies effects to everything below it" },
  { command: "undo", label: "Undo", group: "Edit", keywords: ["back", "revert", "go back", "mistake", "oops", "take back"], shortcut: `${MOD_KEY}Z` },
  { command: "redo", label: "Redo", group: "Edit", keywords: ["forward", "redo", "bring back", "again"], shortcut: `${MOD_SHIFT_KEY}Z` },
  { command: "duplicate", label: "Duplicate selection", group: "Edit", keywords: ["copy", "clone", "another one", "same again", "repeat"], shortcut: `${MOD_KEY}D` },
  { command: "group", label: "Group selection", group: "Edit", keywords: ["combine", "merge", "group layers", "combine layers", "join together", "keep together", "move together"], shortcut: `${MOD_KEY}G` },
  { command: "ungroup", label: "Ungroup", group: "Edit", keywords: ["split", "separate", "ungroup layers", "break apart", "take apart"], shortcut: `${MOD_SHIFT_KEY}G` },
  { command: "select-all", label: "Select all layers", group: "Edit", keywords: ["everything", "all", "whole page"], shortcut: `${MOD_KEY}A` },
  { command: "delete", label: "Delete selection", group: "Edit", keywords: ["remove", "trash", "erase", "get rid of", "clear"], shortcut: "⌫" },
  { command: "export-options", label: "Export or download", group: "Page", keywords: ["save", "png", "jpg", "jpeg", "pdf", "svg", "pptx", "powerpoint", "webp", "download", "get my design", "save image", "share file", "print file"], shortcut: `${MOD_KEY}E` },
  { command: "resize-formats", label: "Resize to formats", group: "Page", keywords: ["magic resize", "resize to other formats", "social kit", "release kit", "youtube thumbnail", "linkedin", "pinterest", "x header", "twitter", "story", "post", "banner", "a4", "size", "reflow", "instagram", "reel", "other sizes", "different size", "change size", "landscape", "portrait", "square", "make versions", "dimensions"], hint: "Makes new pages laid out for each size" },
];

export const ACTION_ENTRIES: PaletteEntry[] = COMMAND_SPECS.map((spec) => ({
  id: `command-${spec.command}`,
  label: spec.label,
  group: spec.group,
  keywords: spec.keywords,
  shortcut: spec.shortcut,
  hint: spec.hint,
  run: () => emitStudioCommand(spec.command),
}));
