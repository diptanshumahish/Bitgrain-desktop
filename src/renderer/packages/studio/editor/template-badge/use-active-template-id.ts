import { useCallback, useState } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";

interface AppliedTemplate {
  templateId: string;
  layerIds: ReadonlySet<string>;
}

interface AppliedTemplateHistory {
  baseTemplateId: string;
  applied: readonly AppliedTemplate[];
}

interface ActiveTemplateTracker {
  activeTemplateId: string;
  recordAppliedTemplate: (previousTemplateId: string, templateId: string, templatePages: TemplatePage[]) => void;
}

const collectLayerIds = (pages: TemplatePage[]): string[] =>
  pages.flatMap((page) => page.layers.map((layer) => layer.id));

const findAppliedTemplate = (applied: readonly AppliedTemplate[], pages: TemplatePage[]): string | null => {
  const currentLayerIds = collectLayerIds(pages);
  const match = [...applied].reverse().find((entry) => currentLayerIds.some((id) => entry.layerIds.has(id)));
  return match ? match.templateId : null;
};

export const useActiveTemplateId = (currentTemplateId: string, pages: TemplatePage[]): ActiveTemplateTracker => {
  const [history, setHistory] = useState<AppliedTemplateHistory | null>(null);

  const recordAppliedTemplate = useCallback(
    (previousTemplateId: string, templateId: string, templatePages: TemplatePage[]): void => {
      const entry: AppliedTemplate = { templateId, layerIds: new Set(collectLayerIds(templatePages)) };
      setHistory((previous) => ({
        baseTemplateId: previous ? previous.baseTemplateId : previousTemplateId,
        applied: [...(previous?.applied ?? []), entry],
      }));
    },
    [],
  );

  const activeTemplateId = history
    ? findAppliedTemplate(history.applied, pages) ?? history.baseTemplateId
    : currentTemplateId;

  return { activeTemplateId, recordAppliedTemplate };
};
