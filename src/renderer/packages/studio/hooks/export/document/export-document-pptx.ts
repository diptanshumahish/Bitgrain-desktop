import type PptxGenJS from "pptxgenjs";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { renderPageToCanvas } from "../export-pages";
import { toDesignFileName } from "../../../io/design-file-name";
import { studioWorkNameSignal } from "../../../state/studio-work-name";
import type { DocumentExportArgs } from "./document-export-types";
import { fitInsideSlide, slideSizeFor, type SlideSize } from "./slide-geometry";

const SLIDE_JPEG_QUALITY = 0.92;
const TRANSPARENT_BACKGROUND = "transparent";
const LAYOUT_NAME = "bitgrain";
const AUTHOR_NAME = "Bitgrain";

const pageImageData = (canvas: HTMLCanvasElement, page: TemplatePage): string =>
  page.background === TRANSPARENT_BACKGROUND
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", SLIDE_JPEG_QUALITY);

const createPresentation = async (slideSize: SlideSize, title: string): Promise<PptxGenJS> => {
  const { default: PptxGenJSClass } = await import("pptxgenjs");
  const presentation = new PptxGenJSClass();
  presentation.title = title;
  presentation.author = AUTHOR_NAME;
  presentation.defineLayout({ name: LAYOUT_NAME, width: slideSize.width, height: slideSize.height });
  presentation.layout = LAYOUT_NAME;
  return presentation;
};

const addPageSlide = async (
  presentation: PptxGenJS,
  page: TemplatePage,
  slideSize: SlideSize,
  args: DocumentExportArgs,
): Promise<void> => {
  const canvas = await renderPageToCanvas(page, args.template, args.image, args.scale, args.watermark);
  const fit = fitInsideSlide(page, slideSize);
  const slide = presentation.addSlide();
  slide.addImage({ data: pageImageData(canvas, page), x: fit.x, y: fit.y, w: fit.width, h: fit.height, altText: page.name });
  if (page.notes?.trim()) slide.addNotes(page.notes);
};

export const exportDocumentPptx = async (args: DocumentExportArgs): Promise<void> => {
  if (args.pages.length === 0) return;
  const title = toDesignFileName(studioWorkNameSignal.value);
  const slideSize = slideSizeFor(args.pages[0]);
  const presentation = await createPresentation(slideSize, title);
  for (const page of args.pages) {
    await addPageSlide(presentation, page, slideSize, args);
  }
  await presentation.writeFile({ fileName: `${title}.pptx`, compression: true });
};
