import { session } from "electron";

export const API_ORIGIN = "https://api.bitgrain.app";
const WEB_ORIGIN = "https://bitgrain.app";
const RENDERER_ORIGIN = "app://bundle";

// CORS response headers the backend sets for the spoofed web origin. We strip any
// case variant of these on API responses before injecting our own, so Chromium
// never sees duplicate values (a second Access-Control-Allow-Origin makes it
// reject the response as "contains multiple values").
const CORS_RESPONSE_KEYS = new Set([
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-methods",
  "access-control-allow-headers",
]);

const PRODUCTION_CSP = [
  "default-src 'self' app:",
  "script-src 'self' app: 'wasm-unsafe-eval'",
  "style-src 'self' app: 'unsafe-inline'",
  `img-src 'self' app: data: blob: ${API_ORIGIN}`,
  "font-src 'self' app: data:",
  `connect-src 'self' app: blob: data: ${API_ORIGIN} http://127.0.0.1:*`,
  "worker-src 'self' app: blob:",
  "object-src 'none'",
].join("; ");

// The renderer lives on the app:// origin (localhost in dev) but the prod backend
// is CORS-locked to the web origin. Rather than change the backend we shim its
// requests in the session: outgoing requests to the API host present the trusted
// web Origin (so the backend's existing CORS + credentialed cookies apply), and
// the responses are rewritten to allow the renderer origin so Chromium's own CORS
// check passes. Cookies the backend sets are stored in the session jar and
// replayed on credentialed requests, so all the ported
// `fetch(..., credentials:"include")` auth/api code works unchanged.
//
// Runs in dev and prod. The production CSP header is only applied in prod (the
// dev server needs its own). In dev the window also drops `webSecurity`, so the
// response CORS headers are moot there — only the outgoing Origin rewrite matters.
export function configureSession(isDev: boolean): void {
  const isApiRequest = (url: string): boolean => url.startsWith(API_ORIGIN);

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const requestHeaders = { ...details.requestHeaders };
    if (isApiRequest(details.url)) {
      requestHeaders["Origin"] = WEB_ORIGIN;
      requestHeaders["Referer"] = `${WEB_ORIGIN}/`;
    }
    callback({ requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isApi = isApiRequest(details.url);
    // Rebuild the header map, dropping the backend's own CORS headers on API
    // responses (they carry the spoofed web origin). Case-insensitive: the backend
    // may send lowercase keys, which would otherwise coexist with the capitalised
    // ones we inject and yield duplicate Access-Control-Allow-Origin values.
    const responseHeaders: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(details.responseHeaders ?? {})) {
      if (isApi && CORS_RESPONSE_KEYS.has(key.toLowerCase())) continue;
      responseHeaders[key] = Array.isArray(value) ? value : [value as string];
    }
    // CSP governs only our own app:// document — never external pages (e.g. the
    // in-app Google OAuth window), which must load with their own policy.
    if (!isDev && details.url.startsWith("app://")) {
      responseHeaders["Content-Security-Policy"] = [PRODUCTION_CSP];
    }
    if (isApi) {
      responseHeaders["Access-Control-Allow-Origin"] = [RENDERER_ORIGIN];
      responseHeaders["Access-Control-Allow-Credentials"] = ["true"];
      responseHeaders["Access-Control-Allow-Methods"] = ["GET, POST, PUT, DELETE, PATCH, OPTIONS"];
      responseHeaders["Access-Control-Allow-Headers"] = ["Content-Type, X-Admin-Token, Authorization"];
    }
    callback({ responseHeaders });
  });
}
