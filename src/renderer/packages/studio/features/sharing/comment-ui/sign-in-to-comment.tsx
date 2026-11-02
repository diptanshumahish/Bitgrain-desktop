import React from "react";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { Button } from "@bitgrain/ui/components/Button";

export const SignInToComment: React.FC = () => (
  <div className="flex-1 flex items-center justify-between gap-3">
    <span className="text-[12px] text-[var(--s-text-muted)]">Sign in to join the conversation.</span>
    <Button variant="primary" size="xs" onClick={() => emitPlatformModal({ type: "login", reason: "generic" })}>
      Sign in to comment
    </Button>
  </div>
);
