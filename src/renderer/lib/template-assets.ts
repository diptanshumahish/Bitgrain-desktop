import { callApi, getAdminToken } from "./api-client";

interface UploadedAsset {
  id: string;
  url: string;
  mime: string;
  size: number;
}

export interface TemplateAsset {
  id: string;
  filename: string;
  mime: string;
  size: number;
  url: string;
}

interface AssetListResponse {
  data: TemplateAsset[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

const UPLOAD_TIMEOUT_MS = 30_000;
const LIBRARY_PAGE_SIZE = 60;

export async function uploadTemplateAsset(
  dataUrl: string,
  filename: string,
): Promise<string | null> {
  if (!getAdminToken()) return null;
  const result = await callApi<UploadedAsset>(
    "/api/admin/assets",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, data: dataUrl }),
    },
    UPLOAD_TIMEOUT_MS,
  );
  return result?.url ?? null;
}

export function hasAssetLibrary(): boolean {
  return Boolean(getAdminToken());
}

export async function listTemplateAssets(page = 1): Promise<TemplateAsset[]> {
  if (!getAdminToken()) return [];
  const result = await callApi<AssetListResponse>(
    `/api/admin/assets?page=${page}&page_size=${LIBRARY_PAGE_SIZE}`,
    undefined,
    UPLOAD_TIMEOUT_MS,
  );
  return result?.data ?? [];
}
