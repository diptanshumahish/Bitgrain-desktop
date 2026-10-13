import { MOD_KEY } from "../../../pages/studio-page/shortcut-labels";

export interface ShortcutItem {
  keys: string;
  label: string;
}

export interface ShortcutGroup {
  title: string;
  items: ShortcutItem[];
}

export const QUICK_SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Tools",
    items: [
      { keys: "V", label: "Select" },
      { keys: "T", label: "Text" },
      { keys: "R", label: "Rectangle" },
      { keys: "P", label: "Pen" },
      { keys: "H", label: "Pan" },
    ],
  },
  {
    title: "Edit",
    items: [
      { keys: `${MOD_KEY}Z`, label: "Undo" },
      { keys: `${MOD_KEY}D`, label: "Duplicate" },
      { keys: `${MOD_KEY}G`, label: "Group" },
      { keys: "⌫", label: "Delete" },
    ],
  },
  {
    title: "View",
    items: [
      { keys: "Space", label: "Pan canvas" },
      { keys: `${MOD_KEY}0`, label: "Zoom to fit" },
      { keys: `${MOD_KEY}1`, label: "Zoom to 100%" },
    ],
  },
];

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
      { keys: `${MOD_KEY}D`, label: "Duplicate selection" },
      { keys: `${MOD_KEY}A`, label: "Select all" },
      { keys: `${MOD_KEY}G`, label: "Group" },
      { keys: `⇧ ${MOD_KEY}G`, label: "Ungroup" },
      { keys: "⌫", label: "Delete" },
      { keys: "Esc", label: "Clear selection" },
    ],
  },
  {
    title: "View",
    items: [
      { keys: "Space + drag", label: "Pan canvas" },
      { keys: `${MOD_KEY}+`, label: "Zoom in" },
      { keys: `${MOD_KEY}-`, label: "Zoom out" },
      { keys: `${MOD_KEY}0`, label: "Zoom to fit" },
      { keys: "⇧ 1", label: "Zoom to fit" },
      { keys: `${MOD_KEY}1`, label: "Zoom to 100%" },
      { keys: `${MOD_KEY} + scroll`, label: "Zoom at the pointer" },
    ],
  },
  {
    title: "File",
    items: [{ keys: `${MOD_KEY}E`, label: "Export" }],
  },
];
