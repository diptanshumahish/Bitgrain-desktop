import { signal } from "@bitgrain/core/signal";
import { fetchTemplateDetail } from "./fetch-template-detail";
import type { TemplateDetail } from "./template-detail-types";

type TemplateDetailStatus = "loading" | "ready" | "missing";

interface TemplateDetailState {
  templateId: string;
  status: TemplateDetailStatus;
  detail: TemplateDetail | null;
}

export const templateDetailSignal = signal<TemplateDetailState>({ templateId: "", status: "loading", detail: null });

export async function loadTemplateDetail(templateId: string): Promise<void> {
  if (templateDetailSignal.value.templateId === templateId) return;
  templateDetailSignal.value = { templateId, status: "loading", detail: null };
  const detail = await fetchTemplateDetail(templateId);
  if (templateDetailSignal.value.templateId !== templateId) return;
  templateDetailSignal.value = { templateId, status: detail ? "ready" : "missing", detail };
}
