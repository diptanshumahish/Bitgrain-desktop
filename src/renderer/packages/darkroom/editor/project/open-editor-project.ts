import { imageSignal } from "../../state/image-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { handleImageUploadFile } from "../upload/handle-image-upload";
import { applyProjectLook } from "./apply-project-look";
import { hasEmbeddedImage, type EditorProjectFile } from "./editor-project-file";

const DEFAULT_IMAGE_NAME = "project-photo";

const PHOTO_MISSING = {
  title: "This project was saved without its photo.",
  detail: "Open the photo first, then open the project again to bring back the look.",
};

const fileFromDataUrl = async (dataUrl: string, name: string): Promise<File> => {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type });
};

export const openEditorProject = async (project: EditorProjectFile): Promise<void> => {
  if (hasEmbeddedImage(project)) {
    const file = await fileFromDataUrl(project.image, project.imageName ?? DEFAULT_IMAGE_NAME);
    await handleImageUploadFile(file, "picker");
  } else if (!imageSignal.value) {
    emitStatusToast(PHOTO_MISSING);
    return;
  }
  applyProjectLook(project);
  trackEvent("home", "btg_project_imported", { details: { modes: project.effects.modes } });
};
