import React from "react";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { MARINE_BUTTON_CLASS } from "../../landing/marketing/marine/marine-classes";

const openSignUp = (): void => {
  trackEvent("auth", "login_modal_open", { details: { trigger: "templates_banner" } });
  emitPlatformModal({ type: "login", reason: "templates" });
};

export const LoginBanner: React.FC = () => {
  return (
    <div className="mb-12 flex flex-col gap-5 rounded-[20px] bg-apricot px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <p className="font-display text-[18px] font-medium tracking-[-0.02em] text-ultramarine">Every template is yours to edit, no account needed</p>
        <p className="mt-1 text-[14px] text-ink-soft/75">Open any of them in the studio straight away. Sign up free when you want to save and export what you make.</p>
      </div>
      <button type="button" onClick={openSignUp} className={`shrink-0 self-start sm:self-auto ${MARINE_BUTTON_CLASS}`}>
        Sign up free
      </button>
    </div>
  );
};
