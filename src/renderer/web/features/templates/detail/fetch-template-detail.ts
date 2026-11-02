import { callApi } from "@bitgrain/api/api-client";
import { normalizeTemplateDetail } from "./normalize-template-detail";
import type { RawTemplateDetail, TemplateDetail } from "./template-detail-types";

export async function fetchTemplateDetail(templateId: string): Promise<TemplateDetail | null> {
  const row = await callApi<RawTemplateDetail>(`/api/templates/${encodeURIComponent(templateId)}/card`);
  return row ? normalizeTemplateDetail(row) : null;
}
