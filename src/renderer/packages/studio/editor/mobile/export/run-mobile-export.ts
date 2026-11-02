import type { ExportPopupData } from "../../../panels/export-state";
import { exportPopupSignal } from "../../../panels/export-state";
import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import type { ExportGrant } from "@bitgrain/platform/billing/export-pack/export-grant";
import { getPlanLimits } from "@bitgrain/platform/plans/plan-limits";
import { clampDimsToLongEdge } from "../../../panels/export-clamp";
import { notifyExportFailed, reportFailedExport } from "../../../hooks/export/notify-export-failed";
import { trackEvent } from "@bitgrain/platform/tracker";
import { renderMobileExport } from "./render-mobile-export";
import { shareOrDownload, type DeliveryResult } from "./share-or-download";
import {
  MOBILE_EXPORT_SCALE,
  mobileExportFileSignal,
  mobileExportFormatSignal,
  mobileExportSizeSignal,
  mobileExportStatusSignal,
  resetMobileExport,
} from "./mobile-export-state";
import { requireAccountToExport } from "@bitgrain/platform/guest-mode/require-account-to-export";

export interface PageSize {
  width: number;
  height: number;
}

export const resolvePageSize = (data: ExportPopupData): PageSize => {
  const page = data.pages?.find((candidate) => candidate.id === data.activePageId);
  return { width: page?.width ?? data.template.width, height: page?.height ?? data.template.height };
};

export const finishDelivery = async (file: File): Promise<void> => {
  const result: DeliveryResult = await shareOrDownload(file);
  if (result === "needs-gesture") return;
  trackEvent("studio", "export_image", { details: { source: "mobile", delivery: result, format: file.type } });
  if (result !== "cancelled") {
    resetMobileExport();
    exportPopupSignal.value = null;
  }
};

const renderFile = (data: ExportPopupData, grant: ExportGrant): Promise<File> => {
  const limits = getPlanLimits(grant.plan);
  const size = resolvePageSize(data);
  const scale = MOBILE_EXPORT_SCALE[mobileExportSizeSignal.value];
  const [width, height] = clampDimsToLongEdge(size.width * scale, size.height * scale, limits.maxExportLongEdge);
  return renderMobileExport({
    template: { ...data.template, width: size.width, height: size.height },
    background: data.background,
    layers: data.layers,
    image: data.image,
    width: Math.round(width),
    height: Math.round(height),
    format: mobileExportFormatSignal.value,
    watermark: limits.watermark,
  });
};

const renderOrReport = async (data: ExportPopupData, grant: ExportGrant): Promise<File | null> => {
  try {
    return await renderFile(data, grant);
  } catch (error) {
    resetMobileExport();
    await reportFailedExport(error, grant);
    return null;
  }
};

export const runMobileExport = async (data: ExportPopupData): Promise<void> => {
  if (!requireAccountToExport()) return;
  mobileExportStatusSignal.value = "rendering";
  const grant = await resolveExportPlan();
  if (!grant) {
    resetMobileExport();
    return;
  }
  const file = await renderOrReport(data, grant);
  if (!file) return;
  await settleExportPack(grant, "done");
  mobileExportFileSignal.value = file;
  mobileExportStatusSignal.value = "ready";
  try {
    await finishDelivery(file);
  } catch (error) {
    resetMobileExport();
    notifyExportFailed(error);
  }
};
