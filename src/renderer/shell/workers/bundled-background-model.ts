import { MODEL_URL } from "@bitgrain/engine/background/model-config";

// Desktop (PORTED.md): web downloads the background-removal model from Hugging
// Face on first use. The desktop bundles the same pinned file
// (public/models/u2netp.onnx, SHA-256 checked by the engine's own
// isTrustedModel), so this worker-side shim answers that one URL from the app
// bundle. Every other request is untouched, and the engine stays verbatim.
const BUNDLED_MODEL_PATH = "/models/u2netp.onnx";

const originalFetch = self.fetch.bind(self);

self.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === MODEL_URL) return originalFetch(new URL(BUNDLED_MODEL_PATH, self.location.origin));
  return originalFetch(input, init);
};
