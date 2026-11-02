import type { TemplateIdentity } from "../../templates/cards/template-summary";
import { trackEvent } from "../../tracker";

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
  signedIn: boolean;
}

export function trackTemplateClick({ template, placement, signedIn }: TemplateClick): void {
  void trackEvent("templates", "template_clicked", {
    details: {
      template_id: template.id,
      template_name: template.name,
      category: template.category,
      placement,
      signed_in: signedIn,
    },
  });
}
