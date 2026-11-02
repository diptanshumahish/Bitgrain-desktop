import React from "react";
import { FolderOpen } from "lucide-react";
import { useBTGImport } from "@bitgrain/studio-core/io/use-btg-import";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { openEditorProject } from "../project/open-editor-project";
import type { EditorProjectFile } from "../project/editor-project-file";

const NOT_A_PROJECT = {
  title: "That file isn't a photo editor project.",
  detail: "Pick a .btg file saved from the photo editor. Studio projects open in Studio.",
};

interface OpenProjectMenuItemProps {
  className: string;
  onDone: () => void;
}

export const OpenProjectMenuItem: React.FC<OpenProjectMenuItemProps> = ({ className, onDone }) => {
  const { importBTG } = useBTGImport();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    onDone();
    if (!file) return;
    const project = await importBTG(file);
    if (!project || project.type !== "image-editor") {
      emitStatusToast(NOT_A_PROJECT);
      return;
    }
    await openEditorProject(project as EditorProjectFile);
  };

  return (
    <label className={`${className} cursor-pointer focus-within:ring-2 focus-within:ring-[var(--s-accent)]`}>
      <FolderOpen size={12} /> Open a saved project (.btg)
      <input type="file" className="sr-only" onChange={(event) => void handleImport(event)} accept=".btg,application/json" aria-label="Open a saved project" />
    </label>
  );
};
