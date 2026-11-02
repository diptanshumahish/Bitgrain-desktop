import { downloadBlob } from "@bitgrain/core/files/download-blob";
import { trackEvent } from "@bitgrain/platform/tracker";
import { renderAsciiTextForExport } from "../../preview/export-render";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { modesSignal } from "../../state/transform-store";
import { currentExportBaseName } from "./export-filename";
import type { TransformMode } from "@bitgrain/engine/core/types";

const TEXT_MIME = "text/plain;charset=utf-8";
const TEXT_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(["ascii", "braille"]);

export const canExportText = (modes: TransformMode[]): boolean => modes.some((mode) => TEXT_MODES.has(mode));

export const downloadTextExport = async (): Promise<void> => {
  try {
    const text = await renderAsciiTextForExport();
    downloadBlob(new Blob([text], { type: TEXT_MIME }), `${currentExportBaseName()}.txt`);
    trackEvent("home", "export_text", { details: { modes: modesSignal.value } });
  } catch (error) {
    console.error("text export failed:", error);
    emitStatusToast({ title: "The text file didn't come out", detail: "Try again, or export a PNG instead." });
  }
};

export const copyTextExport = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(await renderAsciiTextForExport());
    emitStatusToast({ title: "Text copied", detail: "Paste it anywhere that uses a monospace font." });
    trackEvent("home", "export_text_copied", { details: { modes: modesSignal.value } });
  } catch (error) {
    console.error("text copy failed:", error);
    emitStatusToast({ title: "We couldn't copy the text.", detail: "Try downloading it as a text file instead." });
  }
};
