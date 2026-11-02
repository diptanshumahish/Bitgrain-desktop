import type { Layer } from "../../data/studioTypes";

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

export interface ElementData {
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

export interface ElementQuery {
  search: string;
  kind: ElementKind | "";
  collectionId: string;
}

export interface ElementPage {
  data: ElementCard[];
  nextCursor: string;
}
