import type { Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { createStudioBTG, downloadBTG, type BTGStudioPage } from "@bitgrain/studio-core/io/btg-export";
import { activeKit } from "../state/design-kits-store";
import { collectStoredFonts } from "../fonts/custom-font-storage";
import { trackEvent } from "@bitgrain/platform/tracker";
import { toDesignFileName } from "../io/design-file-name";
import { studioWorkNameSignal } from "../state/studio-work-name";
import { withComponentRegistry } from "@bitgrain/studio-core/components/registry/btg-components";
import { requireAccountToExport } from "@bitgrain/platform/guest-mode/require-account-to-export";

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
  notes: page.notes,
});

export const saveStudioBTG = ({
  template, background, layers, image, pages, activePageId,
}: SaveStudioBTGArgs): void => {
  if (!requireAccountToExport()) return;
  const btgPages = pages?.map((page) => toBTGPage(page, activePageId, layers));
  const project = withComponentRegistry(createStudioBTG(
    template.width,
    template.height,
    background,
    layers,
    collectStoredFonts(),
    image,
    btgPages,
    activePageId,
    activeKit() ?? undefined,
  ), pages ?? []);
  downloadBTG(project, `${toDesignFileName(studioWorkNameSignal.value)}.btg`);
  trackEvent("studio", "btg_downloaded", { details: { page_count: btgPages?.length ?? 1 } });
};
