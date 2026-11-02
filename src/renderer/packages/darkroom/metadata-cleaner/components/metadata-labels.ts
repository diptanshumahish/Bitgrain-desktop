import type { MetadataKind } from "../strip/metadata-types";

const METADATA_LABELS: Record<MetadataKind, string> = {
  "ai-label": "AI source label",
  credentials: "Content credentials (C2PA)",
  camera: "Camera, device and location details",
  editing: "Editing history and app info",
  rights: "Captions, credits and rights",
  text: "Hidden text notes",
  other: "Other app data",
};

const LABEL_ORDER: MetadataKind[] = ["ai-label", "credentials", "camera", "editing", "rights", "text", "other"];

export const describeFound = (found: MetadataKind[]): string =>
  LABEL_ORDER.filter((kind) => found.includes(kind)).map((kind) => METADATA_LABELS[kind]).join(", ");
