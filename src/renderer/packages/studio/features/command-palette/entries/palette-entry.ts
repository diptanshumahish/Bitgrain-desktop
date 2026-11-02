export type PaletteGroup = "Add" | "Tools" | "Edit" | "Effects" | "Panels" | "View" | "Page" | "Learn";

export interface PaletteEntry {
  id: string;
  label: string;
  group: PaletteGroup;
  keywords: string[];
  hint?: string;
  shortcut?: string;
  run: () => void;
}
