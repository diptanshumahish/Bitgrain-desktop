import type { TextAnimation } from "../../types";
import { FONT_FAMILIES } from "../../../../data/studioTypes";

export const ANIMATION_OPTIONS: { id: TextAnimation; label: string }[] = [
  { id: "none", label: "None" },
  { id: "fade", label: "Fade" },
  { id: "typewriter", label: "Typewriter" },
  { id: "slide-up", label: "Slide Up" },
  { id: "slide-down", label: "Slide Down" },
  { id: "slide-left", label: "Slide Left" },
  { id: "slide-right", label: "Slide Right" },
  { id: "scale-in", label: "Scale In" },
  { id: "blur-in", label: "Blur In" },
  { id: "bounce", label: "Bounce" },
  { id: "pop", label: "Pop In" },
  { id: "gravity", label: "Gravity Drop" },
  { id: "jump-out", label: "Jump In, Slide Out" },
  { id: "elastic", label: "Sticky Jelly" },
  { id: "swing-in", label: "Swing In" },
  { id: "whoosh", label: "Whoosh" },
];

export interface FontGroup {
  name: string;
  fonts: { label: string; value: string }[];
}

export const FONT_GROUPS: FontGroup[] = Object.entries(
  FONT_FAMILIES.reduce<Record<string, { label: string; value: string }[]>>(
    (acc, f) => ({
      ...acc,
      [f.group]: [...(acc[f.group] ?? []), { label: f.label, value: f.value }],
    }),
    {},
  ),
).map(([name, fonts]) => ({ name, fonts }));

export function fontExistsInLibrary(value: string): boolean {
  return FONT_FAMILIES.some((font) => font.value === value);
}
