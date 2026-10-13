import type { Layer, TemplateDef, TemplatePage } from "../../../data/studioTypes";
import { createStudioBTG, downloadBTG, type BTGStudioPage } from "../../../utils/btg-export";
import { activeKit } from "../../../store/design-kits-store";
import { collectStoredFonts } from "../fonts/custom-font-storage";
import { trackEvent } from "../../../lib/tracker";

interface SaveStudioBTGArgs {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  pages?: TemplatePage[];
  activePageId?: string;
}

const toBTGPage = (page: TemplatePage, activePageId: string | undefined, layers: Layer[]): BTGStudioPage => ({
  id: page.id,
  name: page.name,
  layers: page.id === activePageId ? layers : page.layers,
  background: page.background,
  x: page.x,
  y: page.y,
  width: page.width,
  height: page.height,
  image: page.image ?? null,
  animation: page.animation,
});

export const saveStudioBTG = ({
  template, background, layers, image, pages, activePageId,
}: SaveStudioBTGArgs): void => {
  const btgPages = pages?.map((page) => toBTGPage(page, activePageId, layers));
  const project = createStudioBTG(
    template.width,
    template.height,
    background,
    layers,
    collectStoredFonts(),
    image,
    btgPages,
    activePageId,
    activeKit() ?? undefined,
  );
  downloadBTG(project);
  trackEvent("studio", "btg_downloaded", { details: { page_count: btgPages?.length ?? 1 } });
};
