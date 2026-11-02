import { imageMetaSignal, imageSignal } from "../../state/image-store";
import { captureSnapshot } from "../../state/transform-store";
import { createImageEditorBTG, downloadBTG, type BTGImageEditorProject } from "@bitgrain/studio-core/io/btg-export";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { currentExportBaseName } from "../export/export-filename";
import type { EditorProjectFile } from "./editor-project-file";

const SAVE_FAILED = {
  title: "We couldn't save the project.",
  detail: "Try again, or export the image instead.",
};

const readAsDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the photo"));
    reader.readAsDataURL(blob);
  });

const buildProject = async (imageUrl: string, effects: BTGImageEditorProject["effects"]): Promise<EditorProjectFile> => {
  const blob = await (await fetch(imageUrl)).blob();
  const image = await readAsDataUrl(blob);
  return { ...createImageEditorBTG(image, effects), snapshot: captureSnapshot(), imageName: imageMetaSignal.value?.name };
};

export const saveEditorProject = async (effects: BTGImageEditorProject["effects"]): Promise<void> => {
  const imageUrl = imageSignal.value;
  if (!imageUrl) return;
  try {
    const project = await buildProject(imageUrl, effects);
    downloadBTG(project, `${currentExportBaseName()}.btg`);
  } catch (error) {
    console.error("Could not save the project", error);
    emitStatusToast(SAVE_FAILED);
  }
};
