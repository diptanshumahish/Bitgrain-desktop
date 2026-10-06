import type { Layer, CustomFontEntry, TemplatePage } from "../../data/studioTypes";
import type { BTGStudioProject } from "../../utils/btg-export";
import { makePageId } from "../../data/templates/template-pages";
import { registerKit } from "../../store/design-kits-store";

interface LoadBtgArgs {
  project: BTGStudioProject;
  customFontList: Array<{ label: string; dataUrl: string }>;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (id: string) => void;
  setCanvasW: (w: number) => void;
  setCanvasH: (h: number) => void;
  setImage: (image: string | null) => void;
  resetHistory: () => void;
  setCustomFonts: (updater: (prev: CustomFontEntry[]) => CustomFontEntry[]) => void;
}

const normalizeBtgPages = (
  project: BTGStudioProject,
): TemplatePage[] => {
  if (project.pages && project.pages.length > 0) {
    return project.pages.map((page, index) => ({
      id: page.id ?? makePageId(index + 1),
      name: page.name ?? `Page ${index + 1}`,
      layers: (page.layers as Layer[]) ?? [],
      background: page.background ?? project.background,
      x: page.x ?? 0,
      y: page.y ?? 0,
      width: page.width ?? project.canvasWidth,
      height: page.height ?? project.canvasHeight,
      image: page.image ?? null,
      animation: page.animation,
    }));
  }
  return [
    {
      id: makePageId(1),
      name: "Page 1",
      layers: project.layers as Layer[],
      background: project.background,
      x: 0,
      y: 0,
      width: project.canvasWidth,
      height: project.canvasHeight,
      image: project.image ?? null,
    },
  ];
};

export const applyBtgProject = ({
  project,
  customFontList,
  setPages,
  setActivePageId,
  setCanvasW,
  setCanvasH,
  setImage,
  resetHistory,
  setCustomFonts,
}: LoadBtgArgs): void => {
  const pages = normalizeBtgPages(project);
  setPages(pages);
  setActivePageId(project.activePageId ?? pages[0].id);
  setCanvasW(project.canvasWidth);
  setCanvasH(project.canvasHeight);
  setImage(project.image || null);
  resetHistory();

  if (project.designKit) registerKit(project.designKit);

  if (customFontList.length === 0) return;

  for (const font of customFontList) {
    try {
      localStorage.setItem(
        `bitgrain_font_${font.label}`,
        JSON.stringify({
          dataUrl: font.dataUrl,
          fontName: font.label,
        }),
      );
      const face = new FontFace(font.label, `url(${font.dataUrl})`);
      face
        .load()
        .then((f) => document.fonts.add(f))
        .catch(() => {});
    } catch {
      /* skip */
    }
  }
  const newFontEntries = customFontList.map((f) => ({
    label: f.label,
    value: `'${f.label}', sans-serif`,
    group: "Uploaded" as const,
  }));
  setCustomFonts((prev) => [...prev, ...newFontEntries]);
};
