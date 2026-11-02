import { jsPDF } from "jspdf";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { renderPageToCanvas } from "../export-pages";
import { toDesignFileName } from "../../../io/design-file-name";
import { studioWorkNameSignal } from "../../../state/studio-work-name";
import type { DocumentExportArgs } from "./document-export-types";

const PDF_POINT_UNIT = "pt";
const POINTS_PER_CSS_PIXEL = 0.75;
const PDF_JPEG_QUALITY = 0.92;

type Orientation = "portrait" | "landscape";

const pagePoints = (page: TemplatePage): [number, number] => [
  page.width * POINTS_PER_CSS_PIXEL,
  page.height * POINTS_PER_CSS_PIXEL,
];

const orientationOf = ([width, height]: [number, number]): Orientation =>
  width >= height ? "landscape" : "portrait";

const createDocument = (firstPage: TemplatePage): jsPDF => {
  const size = pagePoints(firstPage);
  return new jsPDF({ unit: PDF_POINT_UNIT, format: size, orientation: orientationOf(size), compress: true });
};

const placePage = async (doc: jsPDF, page: TemplatePage, args: DocumentExportArgs): Promise<void> => {
  const [pointWidth, pointHeight] = pagePoints(page);
  const canvas = await renderPageToCanvas(page, args.template, args.image, args.scale, args.watermark);
  const dataUrl = canvas.toDataURL("image/jpeg", PDF_JPEG_QUALITY);
  doc.addImage(dataUrl, "JPEG", 0, 0, pointWidth, pointHeight, undefined, "FAST");
};

export const exportDocumentPdf = async (args: DocumentExportArgs): Promise<void> => {
  if (args.pages.length === 0) return;
  const doc = createDocument(args.pages[0]);
  for (let index = 0; index < args.pages.length; index++) {
    const page = args.pages[index];
    if (index > 0) doc.addPage(pagePoints(page), orientationOf(pagePoints(page)));
    await placePage(doc, page, args);
  }
  doc.save(`${toDesignFileName(studioWorkNameSignal.value)}.pdf`);
};
