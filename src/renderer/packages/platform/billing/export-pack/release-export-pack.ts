import { postJson } from "@bitgrain/api/post-json";
import { exportPackBalance, storeExportPackBalance } from "./export-pack-balance";

interface ReleaseResponse {
  remaining: number;
  refunded: boolean;
}

interface ReleaseOutcome {
  refunded: boolean;
  remaining: number;
}

export async function releaseExportPack(requestId: string): Promise<ReleaseOutcome> {
  const result = await postJson<ReleaseResponse>("/api/export-pack/release", { requestId });
  if (!result.ok || !result.data) return { refunded: false, remaining: exportPackBalance() };
  storeExportPackBalance(result.data.remaining);
  return { refunded: result.data.refunded, remaining: result.data.remaining };
}
