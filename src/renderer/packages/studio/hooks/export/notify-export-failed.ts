import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import type { ExportGrant } from "@bitgrain/platform/billing/export-pack/export-grant";

const FALLBACK_DETAIL = "Something went wrong while rendering. Your design is safe, try exporting again.";

const exportFailureDetail = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : FALLBACK_DETAIL;

export const notifyExportFailed = (error: unknown): void => {
  console.error("Studio export failed", error);
  emitStatusToast({ title: "Export didn't finish", detail: exportFailureDetail(error) });
};

export const reportFailedExport = async (error: unknown, grant: ExportGrant): Promise<void> => {
  if (!grant.usesPack) {
    notifyExportFailed(error);
    return;
  }
  console.error("Studio export failed", error);
  await settleExportPack(grant, "failed", exportFailureDetail(error));
};
