import { triggerPlatformDownload } from "../../../editor/download-handlers";
import { resolveExportPlan } from "@bitgrain/platform/plans/gate/resolve-export-plan";
import { settleExportPack } from "@bitgrain/platform/billing/export-pack/settle-export-pack";
import type { PlatformPreset } from "../../platform-presets";

export const downloadForPlatform = async (preset: PlatformPreset, transparent: boolean): Promise<void> => {
  const grant = await resolveExportPlan();
  if (!grant) return;
  const delivered = await triggerPlatformDownload({
    presetId: preset.id,
    format: preset.format,
    targetWidth: preset.width,
    targetHeight: preset.height,
    transparent,
    plan: grant.plan,
  });
  await settleExportPack(grant, delivered ? "done" : "failed");
};
