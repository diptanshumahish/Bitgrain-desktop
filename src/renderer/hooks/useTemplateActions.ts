import type { TemplateSummary } from "../lib/template-cards/template-summary";
import { useSignalValue } from "../lib/signal";
import { userSignal } from "./useAuth";
import { isTemplateLocked } from "../lib/template-cards/is-template-locked";
import { templateRecentsSignal } from "../lib/template-cards/template-recents";
import { emitTemplatePreview } from "../components/portal/template-preview/template-preview-events";
import { trackTemplateClick, type TemplatePlacement } from "../modules/tracking/track-template-click";

export interface TemplateActions {
  recents: string[];
  isLocked: (template: TemplateSummary) => boolean;
  isNew: (template: TemplateSummary) => boolean;
  handleOpen: (template: TemplateSummary) => void;
}

export function useTemplateActions(placement: TemplatePlacement): TemplateActions {
  const user = useSignalValue(userSignal);
  const recents = useSignalValue(templateRecentsSignal);

  const isLocked = (template: TemplateSummary): boolean => isTemplateLocked(template, !!user);

  const isNew = (template: TemplateSummary): boolean => template.isNew;

  const handleOpen = (template: TemplateSummary): void => {
    trackTemplateClick({ template, placement, locked: isLocked(template), signedIn: !!user });
    emitTemplatePreview({ template, placement });
  };

  return { recents, isLocked, isNew, handleOpen };
}
