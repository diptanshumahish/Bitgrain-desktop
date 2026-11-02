import { useEffect, useRef } from "react";
import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { FitSize } from "@bitgrain/studio-core/templates/canvas-fit/fit-context";
import { fitTemplateToCanvas, templateMatchesCanvas } from "@bitgrain/studio-core/templates/canvas-fit/fit-template";
import { trackEvent } from "@bitgrain/platform/tracker";
import { markDirty } from "../../state/studio-save-status";
import { requestCanvasFit } from "../../state/canvas-fit-request";
import { promptTemplateSwitch } from "../studio-navigation";
import { announceFittedTemplate } from "./announce-fitted-template";
import { initialTemplateSize, isCanvasUserSized } from "./canvas-size-owner";
import { requestKitAutoApply } from "../../design-kit/auto-apply/kit-auto-apply-request";

interface UseTemplateApplyArgs {
  initial: TemplateDef;
  canvasChosen: boolean;
  template: TemplateDef;
  pages: TemplatePage[];
  activePage: TemplatePage | undefined;
  setTemplate: (template: TemplateDef) => void;
  resetPagesFromTemplate: (template: TemplateDef) => TemplatePage[];
  setCanvasW: (width: number) => void;
  setCanvasH: (height: number) => void;
  setSelectedIds: (ids: string[]) => void;
  setEditingId: (id: string | null) => void;
  pushHistory: () => void;
  recordAppliedTemplate: (previousTemplateId: string, templateId: string, templatePages: TemplatePage[]) => void;
}

interface TemplateApplyApi {
  applyTemplate: (template: TemplateDef) => TemplatePage[];
  handleSelectTemplate: (template: TemplateDef) => void;
}

const hasDesignContent = (pages: TemplatePage[]): boolean =>
  pages.some((page) => page.layers.length > 0 || !!page.image);

const canvasTarget = (page: TemplatePage): FitSize & Pick<TemplatePage, "safeZones"> => ({
  width: page.width,
  height: page.height,
  safeZones: page.safeZones,
});

export const useTemplateApply = (args: UseTemplateApplyArgs): TemplateApplyApi => {
  const argsRef = useRef(args);
  const templateSizeRef = useRef<FitSize | null>(initialTemplateSize(args.initial, args.canvasChosen));

  useEffect(() => {
    argsRef.current = args;
  });

  const loadTemplate = (template: TemplateDef, fitted: boolean): TemplatePage[] => {
    const current = argsRef.current;
    trackEvent("studio", "template_selected", {
      details: { template_id: template.id, width: template.width, height: template.height, fitted },
    });
    current.setTemplate(template);
    requestKitAutoApply("template");
    const templatePages = current.resetPagesFromTemplate(template);
    current.setCanvasW(template.width);
    current.setCanvasH(template.height);
    current.setSelectedIds([]);
    current.setEditingId(null);
    markDirty();
    requestCanvasFit();
    return templatePages;
  };

  const applyTemplate = (template: TemplateDef): TemplatePage[] => {
    templateSizeRef.current = { width: template.width, height: template.height };
    return loadTemplate(template, false);
  };

  const replaceWith = (template: TemplateDef, fitted: boolean): void => {
    const current = argsRef.current;
    current.pushHistory();
    const previousTemplateId = current.template.id;
    const templatePages = fitted ? loadTemplate(template, true) : applyTemplate(template);
    current.recordAppliedTemplate(previousTemplateId, template.id, templatePages);
  };

  const applyFitted = (template: TemplateDef, page: TemplatePage): void => {
    replaceWith(fitTemplateToCanvas(template, canvasTarget(page)), true);
    announceFittedTemplate(template, page, () => replaceWith(template, false));
  };

  const handleSelectTemplate = (template: TemplateDef): void => {
    const { pages, activePage } = argsRef.current;
    const shouldFit = !!activePage && isCanvasUserSized(activePage, templateSizeRef.current) && !templateMatchesCanvas(template, activePage);
    promptTemplateSwitch(hasDesignContent(pages), () => {
      if (shouldFit && activePage) applyFitted(template, activePage);
      else replaceWith(template, false);
    });
  };

  return { applyTemplate, handleSelectTemplate };
};
