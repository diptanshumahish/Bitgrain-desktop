import { trackEvent } from "@bitgrain/platform/tracker";
import { rememberRecentTemplate } from "@bitgrain/platform/templates/cards/template-recents";
import { fetchFullTemplate, peekFullTemplate } from "@bitgrain/platform/templates/cards/full-template-cache";
import { closeTemplatePreview, type ActivePreview } from "../preview-portal/template-preview-store";
import { openStudioTemplate } from "../../../../store/document-tabs-store";

// Desktop (PORTED.md): web navigates to `/studio/edit/<id>?template=<id>`, but
// every open studio tab would read that route template. Instead the full template
// is fetched here and seeded into a new studio tab.
export function useStartTemplate(): (preview: ActivePreview) => void {
  return (preview: ActivePreview): void => {
    const { template, placement } = preview;
    rememberRecentTemplate(template.id);
    trackEvent("templates", "template_selected", {
      details: { template_id: template.id, category: template.category, placement },
    });
    closeTemplatePreview();
    const cached = peekFullTemplate(template.id);
    if (cached) {
      openStudioTemplate(cached);
      return;
    }
    void fetchFullTemplate(template.id).then((full) => {
      if (full) openStudioTemplate(full);
    });
  };
}
