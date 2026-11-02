import type { KitLogo } from "@bitgrain/studio-core/model/design-kit-types";
import { emitInsertImage } from "../../plugins/host/plugin-bus";
import { trackKit } from "../../state/design-kits-store";
import { logoRoleInfo } from "./kit-logo-store";

const LOGO_INSERT_EDGE = 320;

export const insertKitLogo = (logo: KitLogo): void => {
  const scale = Math.min(1, LOGO_INSERT_EDGE / Math.max(logo.width, logo.height, 1));
  emitInsertImage({
    src: logo.src,
    name: logoRoleInfo(logo.role).layerName,
    width: Math.round(logo.width * scale),
    height: Math.round(logo.height * scale),
  });
  trackKit("kit_applied", { token: "logo", role: logo.role });
};
