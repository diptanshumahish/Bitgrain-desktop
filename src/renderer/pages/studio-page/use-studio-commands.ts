import { useEffect, useRef } from "react";
import type { Layer } from "../../data/studioTypes";
import { trackEvent } from "../../lib/tracker";
import { onStudioCommand, type StudioCommand } from "./studio-command-event";

interface UseStudioCommandsArgs {
  layers: Layer[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  pushHistory: () => void;
  handleCopy: (ids: string[]) => void;
  handlePaste: () => void;
  handleDuplicate: (ids: string[]) => void;
}

export const useStudioCommands = (args: UseStudioCommandsArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => {
    const deleteSelection = (current: UseStudioCommandsArgs): void => {
      if (current.selectedIds.length === 0) return;
      current.pushHistory();
      current.setLayers((prev) => prev.filter((layer) => !current.selectedIds.includes(layer.id)));
      current.setSelectedIds([]);
    };
    const run = (command: StudioCommand): void => {
      const current = argsRef.current;
      trackEvent("studio", "edit_command_used", { details: { command } });
      if (command === "copy" && current.selectedIds.length > 0) current.handleCopy(current.selectedIds);
      if (command === "paste") current.handlePaste();
      if (command === "duplicate" && current.selectedIds.length > 0) current.handleDuplicate(current.selectedIds);
      if (command === "delete") deleteSelection(current);
      if (command === "select-all") current.setSelectedIds(current.layers.map((layer) => layer.id));
    };
    return onStudioCommand(run);
  }, []);
};
