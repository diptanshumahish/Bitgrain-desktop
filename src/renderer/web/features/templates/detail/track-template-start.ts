import { trackEvent } from "@bitgrain/platform/tracker";
import { rememberRecentTemplate } from "@bitgrain/platform/templates/cards/template-recents";
import type { TemplateDetail } from "./template-detail-types";

const PLACEMENT = "template_page";

export function trackTemplateStart(detail: TemplateDetail): void {
  rememberRecentTemplate(detail.id);
  trackEvent("templates", "template_selected", {
    details: { template_id: detail.id, category: detail.category, placement: PLACEMENT },
  });
}
