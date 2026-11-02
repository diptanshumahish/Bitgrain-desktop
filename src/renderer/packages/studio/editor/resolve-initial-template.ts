import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import type { BTGStudioProject } from "@bitgrain/studio-core/io/btg-export";
import type { DesignSize } from "@bitgrain/studio-core/design-sizes/new-design-formats";
import { getBlankTemplate } from "@bitgrain/platform/templates/store/templates-store";
import { makePageId } from "@bitgrain/studio-core/templates/template-pages";
import { toPageSafeZones } from "@bitgrain/studio-core/design-sizes/safe-zone-types";

export interface StudioLocationState {
  image?: string;
  fromBTG?: BTGStudioProject;
  canvasSize?: DesignSize;
}

const blankWithSafeZones = (blank: TemplateDef, size: DesignSize): TemplateDef => ({
  ...blank,
  width: size.width,
  height: size.height,
  pages: [
    {
      id: makePageId(1),
      name: "Page 1",
      layers: [],
      background: blank.background,
      width: size.width,
      height: size.height,
      safeZones: toPageSafeZones(size.safeZones ?? [], size.width, size.height),
    },
  ],
});

const blankWithSize = (size: StudioLocationState["canvasSize"]): TemplateDef => {
  const blank = getBlankTemplate();
  if (!size) return blank;
  if (size.safeZones?.length) return blankWithSafeZones(blank, size);
  return { ...blank, width: size.width, height: size.height };
};

export function resolveInitialTemplate(isTemplateMode: boolean, state: StudioLocationState | null): TemplateDef {
  if (isTemplateMode) return getBlankTemplate();
  return blankWithSize(state?.canvasSize);
}

export function isBlankTemplate(template: TemplateDef): boolean {
  return template.id === getBlankTemplate().id;
}
