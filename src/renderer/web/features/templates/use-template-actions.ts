import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { templateRecentsSignal } from "@bitgrain/platform/templates/cards/template-recents";
import { emitTemplatePreview } from "./preview-portal/template-preview-events";
import { trackTemplateClick, type TemplatePlacement } from "@bitgrain/platform/analytics/tracking/track-template-click";

interface TemplateActions {
  recents: string[];
  isNew: (template: TemplateSummary) => boolean;
  handleOpen: (template: TemplateSummary) => void;
}

export function useTemplateActions(placement: TemplatePlacement): TemplateActions {
  const user = useSignalValue(userSignal);
  const recents = useSignalValue(templateRecentsSignal);

  const isNew = (template: TemplateSummary): boolean => template.isNew;

  const handleOpen = (template: TemplateSummary): void => {
    trackTemplateClick({ template, placement, signedIn: !!user });
    emitTemplatePreview({ template, placement });
  };

  return { recents, isNew, handleOpen };
}
