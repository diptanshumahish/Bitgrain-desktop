import type { TemplateIdentity } from "../../lib/template-cards/template-summary";
import { trackEvent } from "../../lib/tracker";

export type TemplatePlacement =
  | "templates_landing"
  | "templates_filtered"
  | "format_page"
  | "hub"
  | "studio_home"
  | "studio_panel"
  | "gallery";

interface TemplateClick {
  template: TemplateIdentity;
  placement: TemplatePlacement;
  locked: boolean;
  signedIn: boolean;
}

export function trackTemplateClick({ template, placement, locked, signedIn }: TemplateClick): void {
  void trackEvent("templates", "template_clicked", {
    details: {
      template_id: template.id,
      template_name: template.name,
      category: template.category,
      placement,
      locked,
      signed_in: signedIn,
    },
  });
}
