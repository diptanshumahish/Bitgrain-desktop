import { trackEvent } from "@bitgrain/platform/tracker";
import type { PaletteEntry } from "./palette-entry";
import { docLinksSignal, type DocLink } from "./doc-links";

const ORDER_PREFIX_PATTERN = /^\d+-/;

const humanize = (slug: string): string => {
  const words = slug.replace(ORDER_PREFIX_PATTERN, "").replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const openDoc = (route: string): void => {
  trackEvent("studio", "palette_doc_opened", { details: { route } });
  window.open(route, "_blank", "noopener");
};

const toDocEntry = ({ folder, file }: DocLink): PaletteEntry => {
  const route = `/docs/${folder}/${file}`;
  return {
    id: `doc-${folder}-${file}`,
    label: humanize(file),
    group: "Learn",
    keywords: ["guide", "help", "how to", "tutorial", humanize(folder)],
    hint: `Guide, ${humanize(folder).toLowerCase()}`,
    run: () => openDoc(route),
  };
};

export const docEntries = (): PaletteEntry[] => docLinksSignal.value.map(toDocEntry);
