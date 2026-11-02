import { ALT_KEY, MOD_ALT_KEY, MOD_KEY, MOD_SHIFT_KEY } from "../editor/shortcut-labels";

export interface ShortcutItem {
  keys: string;
  label: string;
}

export interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

export const ALL_SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Tools",
    items: [
      { keys: "V", label: "Select" },
      { keys: "T", label: "Add text" },
      { keys: "R", label: "Add rectangle" },
      { keys: "F", label: "Frame" },
      { keys: "P", label: "Pen" },
      { keys: "⇧ P", label: "Pencil" },
      { keys: "B", label: "Brush" },
      { keys: "H", label: "Hand, pan the canvas" },
    ],
  },
  {
    title: "Edit",
    items: [
      { keys: `${MOD_KEY}Z`, label: "Undo" },
      { keys: `⇧ ${MOD_KEY}Z`, label: "Redo" },
      { keys: `${MOD_KEY}C`, label: "Copy" },
      { keys: `${MOD_KEY}V`, label: "Paste" },
      { keys: `${MOD_SHIFT_KEY}V`, label: "Paste in place" },
      { keys: `${MOD_SHIFT_KEY}C`, label: "Copy as PNG" },
      { keys: `${MOD_ALT_KEY}C`, label: "Copy style" },
      { keys: `${MOD_ALT_KEY}V`, label: "Paste style" },
      { keys: `${MOD_KEY}D`, label: "Duplicate selection" },
      { keys: `${ALT_KEY} + drag`, label: "Duplicate and drag the copy" },
      { keys: `${MOD_KEY}A`, label: "Select all" },
      { keys: `${MOD_KEY}F`, label: "Find and replace" },
      { keys: `${MOD_KEY}G`, label: "Group" },
      { keys: `⇧ ${MOD_KEY}G`, label: "Ungroup" },
      { keys: `${MOD_ALT_KEY}K`, label: "Create component" },
      { keys: "⌫", label: "Delete" },
      { keys: "Esc", label: "Clear selection" },
    ],
  },
  {
    title: "View",
    items: [
      { keys: `${MOD_KEY}K`, label: "Search tools and actions" },
      { keys: "Space + drag", label: "Pan canvas" },
      { keys: `${MOD_KEY}+`, label: "Zoom in" },
      { keys: `${MOD_KEY}-`, label: "Zoom out" },
      { keys: `${MOD_KEY}0`, label: "Zoom to fit" },
      { keys: "⇧ 1", label: "Zoom to fit" },
      { keys: `${MOD_KEY}1`, label: "Zoom to 100%" },
      { keys: "⇧ 2", label: "Zoom to selection" },
      { keys: "⇧ R", label: "Show or hide rulers" },
      { keys: `${MOD_KEY};`, label: "Show or hide guides" },
      { keys: `${MOD_KEY} + scroll`, label: "Zoom at the pointer" },
      { keys: "G", label: "Slide sorter" },
      { keys: "?", label: "Show keyboard shortcuts" },
    ],
  },
  {
    title: "Arrange",
    items: [
      { keys: "]", label: "Bring forward" },
      { keys: "[", label: "Send backward" },
      { keys: `${MOD_KEY}]`, label: "Bring to front" },
      { keys: `${MOD_KEY}[`, label: "Send to back" },
      { keys: `${MOD_SHIFT_KEY}L`, label: "Lock or unlock" },
      { keys: `${MOD_SHIFT_KEY}H`, label: "Show or hide" },
      { keys: `${MOD_ALT_KEY}M`, label: "Use as mask or release" },
    ],
  },
  {
    title: "File",
    items: [
      { keys: `${MOD_KEY}E`, label: "Export" },
      { keys: `${MOD_ALT_KEY}S`, label: "Save version" },
    ],
  },
];
