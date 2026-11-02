import { Suspense, useCallback } from "react";
import { createPortal } from "react-dom";
import { useModalHost } from "@bitgrain/ui/overlays/modal-host/use-modal-host";
import { onPlatformModal, type PlatformModalEvent } from "@bitgrain/platform/modals/platform-modal-events";
import { ChangelogModal } from "@bitgrain/platform/modals/lazy-platform-modals";

const PLATFORM_HOST_ID = "platform";
const PRICING_URL = "https://bitgrain.app/pricing";

type ChangelogEvent = Extract<PlatformModalEvent, { type: "changelog" }>;

const isPaymentEvent = (event: PlatformModalEvent): boolean =>
  event.type === "studio-payment" || event.type === "upgrade-prompt" || event.type === "free-access";

// Desktop replacement for web's PlatformModalHost. Payments are stripped on
// arrival (CLAUDE.md), so checkout and upgrade events open the web pricing page
// in the browser instead of an in-app checkout. Sign-in is the app-level AuthGate,
// so "login" events are ignored. The post-export upgrade nudge and the support
// ticket form are not shown. Only the changelog renders in-app.
export function DesktopPlatformModalHost() {
  const subscribe = useCallback(
    (handler: (event: ChangelogEvent) => void) =>
      onPlatformModal((event) => {
        if (isPaymentEvent(event)) {
          void window.bitgrain?.openExternal(PRICING_URL);
          return;
        }
        if (event.type === "changelog") handler(event);
      }),
    [],
  );
  const [active, close] = useModalHost<ChangelogEvent>(PLATFORM_HOST_ID, subscribe);
  if (!active) return null;

  return createPortal(
    <Suspense fallback={null}>
      <ChangelogModal onClose={close} />
    </Suspense>,
    document.body,
  );
}
