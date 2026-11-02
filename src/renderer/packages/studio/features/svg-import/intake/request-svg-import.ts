import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { readSvgMarkup, svgSourceAsFile, type SvgSource } from "./svg-detect";
import { emitSvgImportChoice, emitSvgLayersImport } from "./svg-import-events";

type ImageFallback = (file: File) => void;

export const requestSvgImport = async (source: SvgSource, importAsImage: ImageFallback): Promise<void> => {
  const markup = await readSvgMarkup(source).catch(() => null);
  if (!markup) {
    emitStatusToast({ title: "That SVG looks empty", detail: "We could not read any shapes from it, try exporting it again." });
    return;
  }
  emitSvgImportChoice({
    name: source.name,
    onEditable: () => {
      trackEvent("studio", "svg_import_choice", { details: { mode: "editable" } });
      emitSvgLayersImport({ name: source.name, markup });
    },
    onImage: () => {
      trackEvent("studio", "svg_import_choice", { details: { mode: "image" } });
      importAsImage(svgSourceAsFile(source, markup));
    },
  });
};
