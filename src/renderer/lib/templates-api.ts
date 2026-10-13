import type {
  Layer,
  OverlayGradient,
  TemplateDef,
  TemplatePageInput,
} from "../data/studioTypes";
import { mirrorFirstPage } from "./mirror-first-page";

export interface ApiTemplate {
  id: string;
  name: string;
  category: string;
  data: {
    width: number;
    height: number;
    background: string;
    exportScale: number;
    layers: Layer[];
    image?: string | null;
    pages?: TemplatePageInput[];
    overlay?: OverlayGradient;
    tags?: string[];
    addedAt?: string;
  };
  thumbnail: string | null;
  isFree: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
}

export function toTemplateDef(t: ApiTemplate): TemplateDef {
  return mirrorFirstPage({
    ...t.data,
    id: t.id,
    name: t.name,
    category: t.category as TemplateDef["category"],
    free: t.isFree,
    featured: t.featured,
  });
}
