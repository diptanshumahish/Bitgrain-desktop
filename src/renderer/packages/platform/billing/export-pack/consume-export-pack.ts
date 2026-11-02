import { postJson } from "@bitgrain/api/post-json";
import { trackEvent } from "../../tracker";
import { exportPackBalance, storeExportPackBalance } from "./export-pack-balance";

interface ConsumeResponse {
  remaining: number;
}

const EXHAUSTED_STATUS = 402;

export async function consumeExportPack(): Promise<string | null> {
  if (exportPackBalance() <= 0) return null;
  const requestId = crypto.randomUUID();
  const result = await postJson<ConsumeResponse>("/api/export-pack/consume", { requestId });
  if (result.ok && result.data) {
    storeExportPackBalance(result.data.remaining);
    return requestId;
  }
  if (result.status === EXHAUSTED_STATUS) storeExportPackBalance(0);
  trackEvent("payment", "export_pack_spend_failed", { details: { status: result.status } });
  return null;
}
