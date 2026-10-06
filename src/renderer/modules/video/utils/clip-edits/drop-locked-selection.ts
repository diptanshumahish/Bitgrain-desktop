import {
  currentProjectSignal,
  selectedClipIdsSignal,
  setClipSelection,
} from "../../store/project-store";
import { editableClipIds } from "./track-lock";

export function dropLockedFromSelection(): void {
  const project = currentProjectSignal.value;
  if (!project) return;
  const selected = selectedClipIdsSignal.value;
  const editable = editableClipIds(project, selected);
  if (editable.length !== selected.length) setClipSelection(editable);
}
