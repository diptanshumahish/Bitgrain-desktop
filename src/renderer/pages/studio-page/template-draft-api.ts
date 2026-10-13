import { callApi } from "../../lib/api-client";
import type { ApiTemplate } from "../../lib/templates-api";

const SAVE_TIMEOUT_MS = 30_000;

interface DraftResponse extends Omit<ApiTemplate, "id" | "createdAt"> {
  templateId: string;
  updatedAt: string;
}

export interface TemplateCheck {
  errors: string[];
  warnings: string[];
}

export interface EditableTemplate {
  template: ApiTemplate;
  fromDraft: boolean;
}

const draftUrl = (templateId: string): string => `/api/admin/templates/${encodeURIComponent(templateId)}/draft`;

const draftToApiTemplate = (draft: DraftResponse): ApiTemplate => ({
  ...draft,
  id: draft.templateId,
  createdAt: draft.updatedAt,
});

// Unpublished work wins over the live template, so reopening the editor never loses a draft.
export const loadTemplateForEditing = async (templateId: string): Promise<EditableTemplate | null> => {
  const draft = await callApi<DraftResponse>(draftUrl(templateId));
  if (draft) return { template: draftToApiTemplate(draft), fromDraft: true };
  const live = await callApi<ApiTemplate>(`/api/admin/templates/${encodeURIComponent(templateId)}`);
  return live ? { template: live, fromDraft: false } : null;
};

export const saveTemplateDraft = (templateId: string, body: Record<string, unknown>) =>
  callApi<{ templateId: string; check: TemplateCheck }>(
    draftUrl(templateId),
    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    SAVE_TIMEOUT_MS,
  );
