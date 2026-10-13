import type { TemplateDef } from "../../data/studioTypes";

type TemplateCategoryKey = TemplateDef["category"];

export interface TemplateSummary {
  id: string;
  name: string;
  category: TemplateCategoryKey;
  width: number;
  height: number;
  thumbnail: string | null;
  pageCount: number;
  isFree: boolean;
  featured: boolean;
  isNew: boolean;
  tags: string[];
  addedAt: string | null;
}

export interface TemplateIdentity {
  id: string;
  name: string;
  category: string;
}

export interface TemplateDimensions {
  width: number;
  height: number;
}
