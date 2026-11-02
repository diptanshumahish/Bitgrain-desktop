import type { ElementKind } from "./element-types";

interface KindOption {
  value: ElementKind | "";
  label: string;
}

export const KIND_OPTIONS: KindOption[] = [
  { value: "", label: "All" },
  { value: "border", label: "Borders" },
  { value: "corner", label: "Corners" },
  { value: "motif", label: "Motifs" },
  { value: "divider", label: "Dividers" },
  { value: "frame", label: "Frames" },
  { value: "pattern", label: "Patterns" },
  { value: "scene", label: "Scenes" },
];

export const kindLabel = (kind: ElementKind | ""): string =>
  KIND_OPTIONS.find((option) => option.value === kind)?.label ?? kind;
