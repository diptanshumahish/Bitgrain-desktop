import type { TemplateSummary } from "../../../lib/template-cards/template-summary";
import type { TemplatePlacement } from "../../../modules/tracking/track-template-click";

const TEMPLATE_PREVIEW_KEY = "bg:template-preview";

export interface TemplatePreviewRequest {
  template: TemplateSummary;
  placement: TemplatePlacement;
}

export const emitTemplatePreview = (request: TemplatePreviewRequest): void => {
  document.dispatchEvent(new CustomEvent<TemplatePreviewRequest>(TEMPLATE_PREVIEW_KEY, { detail: request }));
};

export const onTemplatePreview = (handler: (request: TemplatePreviewRequest) => void): (() => void) => {
  const listener = (event: Event): void => handler((event as CustomEvent<TemplatePreviewRequest>).detail);
  document.addEventListener(TEMPLATE_PREVIEW_KEY, listener);
  return () => document.removeEventListener(TEMPLATE_PREVIEW_KEY, listener);
};
