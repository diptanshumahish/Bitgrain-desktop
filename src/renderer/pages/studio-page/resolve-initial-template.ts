import type { TemplateDef } from "../../data/studioTypes";
import type { BTGStudioProject } from "../../utils/btg-export";
import { getBlankTemplate } from "../../store/templates-store";

export interface StudioLocationState {
  image?: string;
  fromBTG?: BTGStudioProject;
  canvasSize?: { width: number; height: number };
}

const blankWithSize = (size: StudioLocationState["canvasSize"]): TemplateDef => {
  const blank = getBlankTemplate();
  return size ? { ...blank, width: size.width, height: size.height } : blank;
};

export function resolveInitialTemplate(isTemplateMode: boolean, state: StudioLocationState | null): TemplateDef {
  if (isTemplateMode) return getBlankTemplate();
  return blankWithSize(state?.canvasSize);
}

export function isBlankTemplate(template: TemplateDef): boolean {
  return template.id === getBlankTemplate().id;
}
