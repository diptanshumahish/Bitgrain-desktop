import React from "react";
import { Download } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import { useSignalValue } from "@bitgrain/core/signal";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitExportDialog } from "../../toolbar/export-dialog/export-dialog-events";
import { exportDialogSignal } from "../../toolbar/export-dialog/export-dialog-store";

interface TopBarExportButtonProps {
  disabled: boolean;
}

const openExport = (): void => {
  trackEvent("home", "export_dialog_opened", { details: { source: "top_bar" } });
  emitExportDialog();
};

export const TopBarExportButton: React.FC<TopBarExportButtonProps> = ({ disabled }) => {
  const isOpen = useSignalValue(exportDialogSignal) !== null;
  return (
    <div data-tutorial="home-export" className="ml-2">
      <Button variant="primary" size="sm" onClick={openExport} disabled={disabled} aria-expanded={isOpen}>
        <Download size={12} strokeWidth={1.75} />
        Export
      </Button>
    </div>
  );
};
