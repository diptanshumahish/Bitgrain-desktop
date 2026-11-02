import type { TemplatePage } from "../../model/studio-types";
import type { BTGStudioProject } from "../../io/btg-export";
import { collectComponents } from "./collect-components";

export const withComponentRegistry = (project: BTGStudioProject, pages: TemplatePage[]): BTGStudioProject => {
  const components = collectComponents(pages);
  return components.length > 0 ? { ...project, components } : project;
};
