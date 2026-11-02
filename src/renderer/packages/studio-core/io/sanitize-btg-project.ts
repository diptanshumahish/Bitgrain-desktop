import type { BTGProject, BTGStudioPage } from "./btg-export";
import { sanitizeLayerTree } from "@bitgrain/core/html-sanitize/sanitize-text-layers";

const sanitizeLayerList = (layers: unknown): unknown[] => (Array.isArray(layers) ? sanitizeLayerTree(layers) : []);

const sanitizePage = (page: BTGStudioPage): BTGStudioPage => ({ ...page, layers: sanitizeLayerList(page.layers) });

export const sanitizeBtgProject = (project: BTGProject): BTGProject => {
  if (project.type !== "studio") return project;
  const pages = Array.isArray(project.pages) ? project.pages.map(sanitizePage) : undefined;
  return { ...project, layers: sanitizeLayerList(project.layers), pages };
};
