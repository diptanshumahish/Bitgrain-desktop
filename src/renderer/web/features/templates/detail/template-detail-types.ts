export interface TemplateDetail {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  thumbnail: string | null;
  pageCount: number;
  description: string;
  useCases: string[];
  tags: string[];
  insights: TemplateInsights | null;
  addedAt: string | null;
}

export interface TemplateTextRole {
  layer: string;
  font: string;
  fontSize: number;
}

export interface TemplateInsights {
  fonts: string[];
  palette: string[];
  background: string;
  effects: string[];
  textLayers: number;
  imageLayers: number;
  shapeLayers: number;
  textRoles: TemplateTextRole[];
  exportScale: number;
}

export interface RawTemplateDetail {
  id: string;
  name: string;
  category: string;
  width?: number;
  height?: number;
  thumbnail?: string | null;
  pageCount?: number;
  description?: string | null;
  useCases?: string[] | null;
  tags?: string[] | null;
  insights?: Partial<TemplateInsights> | null;
  addedAt?: string | null;
}
