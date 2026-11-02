import { signal } from "@bitgrain/core/signal";
import type { KitLogo, KitLogoRole } from "@bitgrain/studio-core/model/design-kit-types";
import { updateKitById } from "../../state/design-kits-store";

interface KitLogoRoleInfo {
  role: KitLogoRole;
  label: string;
  hint: string;
  layerName: string;
}

export const KIT_LOGO_ROLES: KitLogoRoleInfo[] = [
  { role: "primary", label: "Primary", hint: "Your main logo", layerName: "Logo" },
  { role: "mark", label: "Mark", hint: "Icon or monogram", layerName: "Logo mark" },
  { role: "onDark", label: "Light on dark", hint: "For dark backgrounds", layerName: "Logo light" },
];

export const uploadingLogoRoleSignal = signal<KitLogoRole | null>(null);

export const logoRoleInfo = (role: KitLogoRole): KitLogoRoleInfo =>
  KIT_LOGO_ROLES.find((info) => info.role === role) ?? KIT_LOGO_ROLES[0];

export const setKitLogo = (kitId: string, logo: KitLogo): void =>
  updateKitById(kitId, (kit) => ({
    ...kit,
    logos: [...(kit.logos ?? []).filter((existing) => existing.role !== logo.role), logo],
  }));

export const removeKitLogo = (kitId: string, role: KitLogoRole): void =>
  updateKitById(kitId, (kit) => ({
    ...kit,
    logos: (kit.logos ?? []).filter((existing) => existing.role !== role),
  }));
