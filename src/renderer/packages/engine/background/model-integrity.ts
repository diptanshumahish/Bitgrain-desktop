import { MODEL_SHA256 } from "./model-config";
import { sha256Hex } from "./verified-download";

export const isTrustedModel = async (bytes: Uint8Array<ArrayBuffer>): Promise<boolean> => (await sha256Hex(bytes)) === MODEL_SHA256;
