import { useEffect, useRef } from "react";
import type { Layer, ShapeType } from "@bitgrain/studio-core/model/studio-types";
import { trackEvent } from "@bitgrain/platform/tracker";
import { removeLayersByIds } from "@bitgrain/studio-core/layers/remove-layers";
import { onStudioCommand, type StudioCommand } from "./studio-command-event";
import { onSelectLayers } from "./select-layers-event";
import { unlockedLayerIds } from "./selection-ops";

interface UseStudioCommandsArgs {
  layers: Layer[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  setLayers: (updater: (prev: Layer[]) => Layer[]) => void;
  pushHistory: () => void;
  handleCopy: (ids: string[]) => void;
  handlePaste: () => void;
  handleDuplicate: (ids: string[]) => void;
  handleAddText: () => void;
  handleAddShape: (shapeType: ShapeType) => void;
  handleAddImage: () => void;
  handleAddAdjustment: () => void;
  handleGroup: () => void;
  handleUngroup: () => void;
  undo: () => void;
  redo: () => void;
}

type CommandRunner = (current: UseStudioCommandsArgs) => void;

const deleteSelection: CommandRunner = (current) => {
  const deletableIds = unlockedLayerIds(current.layers, current.selectedIds);
  if (deletableIds.length === 0) return;
  current.pushHistory();
  current.setLayers((prev) => removeLayersByIds(prev, deletableIds));
  current.setSelectedIds([]);
};

const selectAll: CommandRunner = (current) =>
  current.setSelectedIds(current.layers.filter((layer) => layer.visible && !layer.locked).map((layer) => layer.id));

const withSelection = (run: CommandRunner): CommandRunner => (current) => {
  if (current.selectedIds.length > 0) run(current);
};

const COMMAND_RUNNERS: Partial<Record<StudioCommand, CommandRunner>> = {
  copy: withSelection((current) => current.handleCopy(current.selectedIds)),
  paste: (current) => current.handlePaste(),
  duplicate: withSelection((current) => current.handleDuplicate(current.selectedIds)),
  delete: deleteSelection,
  "select-all": selectAll,
  "add-text": (current) => current.handleAddText(),
  "add-rect": (current) => current.handleAddShape("rect"),
  "add-circle": (current) => current.handleAddShape("circle"),
  "add-line": (current) => current.handleAddShape("line"),
  "add-image": (current) => current.handleAddImage(),
  "add-adjustment": (current) => current.handleAddAdjustment(),
  undo: (current) => current.undo(),
  redo: (current) => current.redo(),
  group: withSelection((current) => current.handleGroup()),
  ungroup: withSelection((current) => current.handleUngroup()),
};

export const useStudioCommands = (args: UseStudioCommandsArgs): void => {
  const argsRef = useRef(args);

  useEffect(() => {
    argsRef.current = args;
  });

  useEffect(() => onStudioCommand((command) => {
    const runner = COMMAND_RUNNERS[command];
    if (!runner) return;
    trackEvent("studio", "edit_command_used", { details: { command } });
    runner(argsRef.current);
  }), []);

  useEffect(() => onSelectLayers((layerIds) => argsRef.current.setSelectedIds(layerIds)), []);
};
