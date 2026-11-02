import type { DesignKit } from "@bitgrain/studio-core/model/design-kit-types";
import { designKitsSignal, trackKit, updateKitById } from "../../state/design-kits-store";

export const autoApplyKit = (): DesignKit | null =>
  designKitsSignal.value.find((kit) => kit.autoApply === true) ?? null;

export const setKitAutoApply = (id: string, enabled: boolean): void => {
  for (const kit of designKitsSignal.value) {
    const next = kit.id === id ? enabled : false;
    if ((kit.autoApply === true) !== next) updateKitById(kit.id, (current) => ({ ...current, autoApply: next }));
  }
  trackKit("kit_applied", { token: "auto_apply", enabled });
};
