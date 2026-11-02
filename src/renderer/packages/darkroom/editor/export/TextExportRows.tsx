import React from "react";
import { ClipboardCopy, FileText } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { modesSignal } from "../../state/transform-store";
import { canExportText, copyTextExport, downloadTextExport } from "./download-text";
import { ExportOptionRow } from "../../toolbar/export-menu/ExportOptionRow";

interface TextExportRowsProps {
  onClose: () => void;
}

export const TextExportRows: React.FC<TextExportRowsProps> = ({ onClose }) => {
  const modes = useSignalValue(modesSignal);
  if (!canExportText(modes)) return null;
  const run = (action: () => Promise<void>): void => {
    void action();
    onClose();
  };
  return (
    <>
      <ExportOptionRow icon={FileText} title="Text file" hint="The characters themselves, as a .txt" onClick={() => run(downloadTextExport)} />
      <ExportOptionRow icon={ClipboardCopy} title="Copy as text" hint="Paste into a chat, code or a README" onClick={() => run(copyTextExport)} />
    </>
  );
};
