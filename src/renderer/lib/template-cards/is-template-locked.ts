import { backendEnabled } from "../api-client";

const LOCAL_HOSTNAME = "localhost";

export function isTemplateLocked(template: { isFree: boolean }, signedIn: boolean): boolean {
  const isLocalhost = window.location.hostname === LOCAL_HOSTNAME;
  return backendEnabled && !signedIn && !template.isFree && !isLocalhost;
}
