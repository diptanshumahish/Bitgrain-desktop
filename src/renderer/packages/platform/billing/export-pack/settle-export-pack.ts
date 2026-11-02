import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "../../tracker";
import type { ExportGrant, ExportOutcome } from "./export-grant";
import { exportPackBalance } from "./export-pack-balance";
import { releaseExportPack } from "./release-export-pack";

const SENTENCE_END = /[.!?]$/;

const asSentence = (text: string): string => (SENTENCE_END.test(text) ? text : `${text}.`);

const withReason = (detail: string, reason?: string): string =>
  reason ? `${asSentence(reason.trim())} ${detail}` : detail;

const remainingDetail = (remaining: number): string =>
  remaining === 0 ? "That was the last one in your pack." : `${remaining} left in your pack.`;

const announceSpent = (): void => {
  const remaining = exportPackBalance();
  trackEvent("payment", "export_pack_spent", { details: { remaining } });
  emitStatusToast({ title: "Clean export, no watermark", detail: remainingDetail(remaining) });
};

const announceRelease = (outcome: ExportOutcome, refunded: boolean, remaining: number, reason?: string): void => {
  const detail = refunded
    ? `Your clean export wasn't used, ${remaining} still left in your pack.`
    : "We couldn't return this clean export to your pack.";
  emitStatusToast({
    title: outcome === "cancelled" ? "Export stopped" : "Export didn't finish",
    detail: withReason(detail, reason),
  });
};

export async function settleExportPack(grant: ExportGrant, outcome: ExportOutcome, reason?: string): Promise<void> {
  if (!grant.usesPack || !grant.packRequestId) return;
  if (outcome === "done") {
    announceSpent();
    return;
  }
  const release = await releaseExportPack(grant.packRequestId);
  trackEvent("payment", "export_pack_kept", { details: { outcome, refunded: release.refunded, remaining: release.remaining } });
  announceRelease(outcome, release.refunded, release.remaining, reason);
}
