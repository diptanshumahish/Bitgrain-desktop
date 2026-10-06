export interface PluginFacet {
  id: string;
  label: string;
  values: string[];
}

export interface PluginManifest {
  capabilities?: string[];
  search?: { facets?: PluginFacet[] };
  ui?: { tile?: string; columns?: number };
}

export interface Plugin {
  id: string;
  slug: string;
  name: string;
  version: string;
  kind: string;
  icon: string | null;
  manifest: PluginManifest;
  enabled: boolean;
}

export interface PluginAsset {
  id: string;
  pluginId: string;
  slug: string;
  name: string;
  kind: string;
  tags: string[];
  meta: Record<string, unknown>;
  mime: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export interface AssetSearchResult {
  items: PluginAsset[];
  total: number;
  limit: number;
  offset: number;
}

export interface InsertImagePayload {
  src: string;
  name: string;
  width?: number;
  height?: number;
}
