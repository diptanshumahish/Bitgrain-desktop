import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import type { TemplatePlacement } from "@bitgrain/platform/analytics/tracking/track-template-click";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const TEMPLATE_PREVIEW_KEY = "bg:template-preview";

export interface TemplatePreviewRequest {
  template: TemplateSummary;
  placement: TemplatePlacement;
}

const templatePreviewChannel = createEventChannel<TemplatePreviewRequest>(TEMPLATE_PREVIEW_KEY);

export const emitTemplatePreview = templatePreviewChannel.emit;
export const onTemplatePreview = templatePreviewChannel.on;

