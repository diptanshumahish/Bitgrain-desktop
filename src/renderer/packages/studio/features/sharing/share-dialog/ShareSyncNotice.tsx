import React from "react";
import { CloudUpload } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import { useSignalValue } from "@bitgrain/core/signal";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { userSignal } from "@bitgrain/platform/auth/use-auth";
import { planAllowsCloudCreate } from "@bitgrain/platform/projects/save-to-cloud";
import { shareBusySignal } from "./share-dialog-store";
import { FREE_CLOUD_PROJECT_LIMIT } from "@bitgrain/platform/plans/plan-limits";

interface ShareSyncNoticeProps {
  onSyncNow: () => Promise<void>;
}

interface NoticeCopy {
  title: string;
  detail: string;
}

const SIGNED_OUT_COPY: NoticeCopy = {
  title: "Sign in to share this design",
  detail: "Share links open your design from the cloud, so it needs to be saved to your account first.",
};

const FREE_PLAN_COPY: NoticeCopy = {
  title: "Your free cloud space is full",
  detail: `The free plan keeps ${FREE_CLOUD_PROJECT_LIMIT} projects in the cloud. Delete one you no longer need, or move to Pro to sync and share every design.`,
};

const LOCAL_COPY: NoticeCopy = {
  title: "This design isn't in the cloud yet",
  detail: "Sync it now and you can share a link right after.",
};

export const ShareSyncNotice: React.FC<ShareSyncNoticeProps> = ({ onSyncNow }) => {
  const user = useSignalValue(userSignal);
  const busy = useSignalValue(shareBusySignal);
  const canSync = !!user && planAllowsCloudCreate();
  const copy = !user ? SIGNED_OUT_COPY : canSync ? LOCAL_COPY : FREE_PLAN_COPY;

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl bg-[var(--s-bg-input)] p-4">
      <CloudUpload size={18} strokeWidth={1.75} className="text-[var(--s-text-muted)]" />
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold text-[var(--s-text)]">{copy.title}</span>
        <span className="text-[12px] leading-relaxed text-[var(--s-text-muted)]">{copy.detail}</span>
      </div>
      {!user && (
        <Button variant="primary" size="sm" onClick={() => emitPlatformModal({ type: "login", reason: "studio" })}>
          Sign in
        </Button>
      )}
      {user && !canSync && (
        <Button variant="primary" size="sm" onClick={() => emitPlatformModal({ type: "studio-payment" })}>
          See Pro
        </Button>
      )}
      {canSync && (
        <Button variant="primary" size="sm" loading={busy} onClick={() => void onSyncNow()}>
          Sync now
        </Button>
      )}
    </div>
  );
};
