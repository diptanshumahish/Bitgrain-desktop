export interface BTGImageEditorProject {
  type: "image-editor";
  version: 1;
  timestamp: number;
  image: string;
  effects: {
    modes: string[];
    lutId: string | null;
    ditherMethod: string;
    ditherFactor: number;
    resolution: number;
    contrast: number;
    brightness: number;
    saturation: number;
    grain: number;
    hue: number;
    isColor: boolean;
    palette: { id: string; colors: string[] } | null;
    hazeIntensity: number;
    bloomIntensity: number;
    bloomThreshold: number;
    hazeWarmth: string;
  };
}

export interface BTGStudioPage {
  id: string;
  name: string;
  layers: unknown[];
  background: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  image?: string | null;
  animation?: import("../data/animation-types").PageAnimation;
}

export interface BTGStudioProject {
  type: "studio";
  version: 1;
  timestamp: number;
  canvasWidth: number;
  canvasHeight: number;
  background: string;
  layers: unknown[];
  pages?: BTGStudioPage[];
  activePageId?: string;
  customFonts: Array<{
    label: string;
    dataUrl: string;
  }>;
  image?: string | null;
  designKit?: import("../data/design-kit-types").DesignKit;
}

export type BTGProject = BTGImageEditorProject | BTGStudioProject;

export function createImageEditorBTG(
  image: string,
  effects: BTGImageEditorProject["effects"],
): BTGImageEditorProject {
  return {
    type: "image-editor",
    version: 1,
    timestamp: Date.now(),
    image,
    effects,
  };
}

export function createStudioBTG(
  canvasWidth: number,
  canvasHeight: number,
  background: string,
  layers: unknown[],
  customFonts: Array<{ label: string; dataUrl: string }>,
  image?: string | null,
  pages?: BTGStudioPage[],
  activePageId?: string,
  designKit?: BTGStudioProject["designKit"],
): BTGStudioProject {
  return {
    type: "studio",
    version: 1,
    timestamp: Date.now(),
    canvasWidth,
    canvasHeight,
    background,
    layers,
    pages,
    activePageId,
    customFonts,
    image,
    designKit,
  };
}

export function downloadBTG(project: BTGProject, filename?: string): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    filename || `bitgrain-${project.type}-${project.timestamp}.btg`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function loadBTG(file: File): Promise<BTGProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json as BTGProject);
      } catch {
        reject(new Error("Invalid BTG file format"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
