import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { TemplateDef } from "../../data/studioTypes";
import { fetchFullTemplate, peekFullTemplate } from "./full-template-cache";
import { readTemplateParam } from "./template-studio-path";

interface RouteTemplateState {
  templateId?: string;
}

export function readRouteTemplateId(state: unknown, search: string): string | null {
  const routeState = state as RouteTemplateState | null;
  return routeState?.templateId ?? readTemplateParam(search);
}

export function peekRouteTemplate(templateId: string | null): TemplateDef | undefined {
  return templateId ? peekFullTemplate(templateId) : undefined;
}

export function useApplyRouteTemplate(
  templateId: string | null,
  initialId: string,
  applyTemplate: (template: TemplateDef) => void,
): void {
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const applyRef = useRef(applyTemplate);
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    applyRef.current = applyTemplate;
  });

  useEffect(() => {
    if (!templateId || handledRef.current === templateId) return;
    handledRef.current = templateId;
    const clearParam = (): void => {
      if (readTemplateParam(search)) navigate(pathname, { replace: true, state });
    };
    if (initialId === templateId) {
      clearParam();
      return;
    }
    void fetchFullTemplate(templateId).then((template) => {
      if (!template) return;
      applyRef.current(template);
      clearParam();
    });
  }, [templateId, initialId, pathname, search, state, navigate]);
}
