import type { KitLogoRole } from "@bitgrain/studio-core/model/design-kit-types";
import { newId } from "@bitgrain/studio-core/model/design-kit-types";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackKit } from "../../state/design-kits-store";
import { setKitLogo, uploadingLogoRoleSignal } from "./kit-logo-store";
import { storeLogoFile } from "./store-logo-file";

const UPLOAD_FAILED_TITLE = "Logo not added";
const UPLOAD_FALLBACK_DETAIL = "Something went wrong while saving the logo.";

export const uploadKitLogo = async (kitId: string, role: KitLogoRole, file: File): Promise<void> => {
  uploadingLogoRoleSignal.value = role;
  try {
    const stored = await storeLogoFile(file);
    setKitLogo(kitId, { id: newId(), role, ...stored });
    trackKit("kit_token_added", { token: "logo", role });
  } catch (error) {
    const detail = error instanceof Error ? error.message : UPLOAD_FALLBACK_DETAIL;
    emitStatusToast({ title: UPLOAD_FAILED_TITLE, detail });
  } finally {
    uploadingLogoRoleSignal.value = null;
  }
};
