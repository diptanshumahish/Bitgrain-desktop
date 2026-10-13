import { callApi } from "../../lib/api-client";
import type { ElementCollection, ElementDetail, ElementPage, ElementQuery } from "./element-types";

const detailCache = new Map<string, Promise<ElementDetail | null>>();

export async function fetchElementCollections(): Promise<ElementCollection[]> {
  const response = await callApi<{ collections: ElementCollection[] }>("/api/element-collections");
  return response?.collections ?? [];
}

export async function fetchElementPage(query: ElementQuery, cursor: string): Promise<ElementPage> {
  const params = new URLSearchParams({ q: query.search, kind: query.kind, collection: query.collectionId, cursor });
  const response = await callApi<ElementPage>(`/api/elements?${params.toString()}`);
  return response ?? { data: [], nextCursor: "" };
}

export function fetchElementDetail(elementId: string): Promise<ElementDetail | null> {
  const cached = detailCache.get(elementId);
  if (cached) return cached;
  const request = callApi<ElementDetail>(`/api/elements/${encodeURIComponent(elementId)}`);
  detailCache.set(elementId, request);
  request.then((detail) => {
    if (!detail) detailCache.delete(elementId);
  }, () => detailCache.delete(elementId));
  return request;
}
