import type { BTGImageEditorProject } from "@bitgrain/studio-core/io/btg-export";
import type { TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";

export interface EditorProjectFile extends BTGImageEditorProject {
  snapshot?: TransformSnapshot;
  imageName?: string;
}

const DATA_URL_PREFIX = "data:";

export const hasEmbeddedImage = (project: EditorProjectFile): boolean => project.image.startsWith(DATA_URL_PREFIX);
