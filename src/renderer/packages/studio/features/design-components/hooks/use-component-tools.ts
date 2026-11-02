import { useEffect, useRef } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { onComponentAction, type ComponentAction } from "@bitgrain/studio-core/components/events/component-events";
import { runComponentAction } from "@bitgrain/studio-core/components/actions/run-component-action";
import { isFailure } from "@bitgrain/studio-core/components/actions/component-action-context";
import { useComponentShortcut } from "./use-component-shortcut";

interface UseComponentToolsArgs {
  pages: TemplatePage[];
  activePageId: string;
  selectedIds: string[];
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (pageId: string) => void;
  setSelectedIds: (ids: string[]) => void;
  pushHistory: () => void;
}

const applyAction = (action: ComponentAction, args: UseComponentToolsArgs): void => {
  const outcome = runComponentAction(action, args);
  if (isFailure(outcome)) {
    emitStatusToast({ title: "Components", detail: outcome.failure });
    return;
  }
  if (outcome.pages !== args.pages) {
    args.pushHistory();
    args.setPages(outcome.pages);
  }
  if (outcome.activePageId && outcome.activePageId !== args.activePageId) args.setActivePageId(outcome.activePageId);
  if (outcome.selectIds) args.setSelectedIds(outcome.selectIds);
  trackEvent("studio", "component_action", { details: { action: action.kind } });
};

export const useComponentTools = (args: UseComponentToolsArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => onComponentAction((action) => applyAction(action, argsRef.current)), []);

  useComponentShortcut();
};
