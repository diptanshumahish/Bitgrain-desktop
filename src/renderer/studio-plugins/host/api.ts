import type { AssetSearchResult, Plugin } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) || "";

export function resolveAssetUrl(url: string): string {
  if (!url) return url;
  if (/^https?:/i.test(url)) return url;
  return `${API_BASE}${url}`;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPlugins(signal?: AbortSignal): Promise<Plugin[] | null> {
  return await getJson<Plugin[]>("/api/plugins", signal);
}

export interface SearchQuery {
  q?: string;
  kind?: string;
  limit?: number;
  offset?: number;
}

export async function searchPluginAssets(
  slug: string,
  query: SearchQuery,
  signal?: AbortSignal,
): Promise<AssetSearchResult> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.kind) params.set("kind", query.kind);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));
  const path = `/api/plugins/${encodeURIComponent(slug)}/search?${params.toString()}`;
  const res = await getJson<AssetSearchResult>(path, signal);
  return res ?? { items: [], total: 0, limit: query.limit ?? 30, offset: query.offset ?? 0 };
}
