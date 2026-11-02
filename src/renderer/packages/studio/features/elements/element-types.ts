import type { Layer } from "@bitgrain/studio-core/model/studio-types";

export type ElementKind = "border" | "corner" | "divider" | "motif" | "frame" | "pattern" | "scene";

export interface ElementCard {
  id: string;
  name: string;
  kind: ElementKind;
  collectionId: string;
  description: string;
  useCases: string[];
  tags: string[];
  width: number;
  height: number;
  thumbnail: string | null;
  isFree: boolean;
}

interface ElementData {
  width: number;
  height: number;
  layers: Layer[];
}

export interface ElementDetail extends ElementCard {
  data: ElementData;
}

export interface ElementCollection {
  id: string;
  name: string;
  credit: string;
  count: number;
  preview: ElementCard[];
}

export type LoadStatus = "idle" | "loading" | "ready" | "failed";

export interface ElementQuery {
  search: string;
  kind: ElementKind | "";
}

export interface ElementPage {
  data: ElementCard[];
  nextCursor: string;
}
