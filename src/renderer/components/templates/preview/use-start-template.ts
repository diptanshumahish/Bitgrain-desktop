import { trackEvent } from "../../../lib/tracker";
import { rememberRecentTemplate } from "../../../lib/template-cards/template-recents";
import { fetchFullTemplate, peekFullTemplate } from "../../../lib/template-cards/full-template-cache";
import { openStudioTemplate } from "../../../store/document-tabs-store";
import { closeTemplatePreview, type ActivePreview } from "../../portal/template-preview/template-preview-store";

// Desktop: web navigates to `/studio/edit/<id>?template=<id>`, but every open
// studio surface reads the route template, so a hidden studio tab would swallow
// it. Instead the full template is fetched here and seeded into a new studio tab.
export function useStartTemplate(): (preview: ActivePreview) => void {
  return (preview: ActivePreview): void => {
    const { template, placement, locked } = preview;
    rememberRecentTemplate(template.id);
    trackEvent("templates", "template_selected", {
      details: { template_id: template.id, category: template.category, placement, locked },
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
