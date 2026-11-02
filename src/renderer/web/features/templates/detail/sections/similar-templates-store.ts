import { callApi } from "@bitgrain/api/api-client";
import { signal } from "@bitgrain/core/signal";
import { normalizeTemplateDetail } from "../normalize-template-detail";
import { similarTemplates, type SimilarTemplate } from "../insights/similar-templates";
import type { RawTemplateDetail, TemplateDetail } from "../template-detail-types";

interface SimilarState {
  templateId: string;
  similar: SimilarTemplate[];
}

interface CardPage {
  data: RawTemplateDetail[] | null;
}

export const similarTemplatesSignal = signal<SimilarState>({ templateId: "", similar: [] });

const categoryPagePath = (category: string): string =>
  `/api/templates?${new URLSearchParams({ view: "card", category }).toString()}`;

export async function loadSimilarTemplates(detail: TemplateDetail): Promise<void> {
  if (similarTemplatesSignal.value.templateId === detail.id) return;
  similarTemplatesSignal.value = { templateId: detail.id, similar: [] };
  const page = await callApi<CardPage>(categoryPagePath(detail.category));
  if (similarTemplatesSignal.value.templateId !== detail.id) return;
  const pool = (page?.data ?? []).map(normalizeTemplateDetail);
  similarTemplatesSignal.value = { templateId: detail.id, similar: similarTemplates(detail, pool) };
}
