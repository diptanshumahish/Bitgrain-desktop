import React, { useEffect } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import { Spinner } from "@bitgrain/ui/components/Spinner";
import { useSignalValue } from "@bitgrain/core/signal";
import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";
import { ShareDialogFrame } from "./ShareDialogFrame";
import { ShareLinkField } from "./ShareLinkField";
import { ShareSettingsForm } from "./ShareSettingsForm";
import { ShareSyncNotice } from "./ShareSyncNotice";
import { applyShareSettings, createShareLink, loadShareLink } from "./share-dialog-actions";
import {
  resetShareDialog,
  settingsOf,
  shareBusySignal,
  shareDraftSignal,
  shareErrorSignal,
  shareLinkSignal,
  shareNeedsProSignal,
  shareStatusSignal,
} from "./share-dialog-store";
import { ShareNeedsProMessage } from "./share-needs-pro-message";

interface ShareDialogProps {
  projectId: string;
  syncNow: () => Promise<CloudSyncOutcome>;
  onClose: () => void;
}

const SYNC_FAILED_MESSAGE = "We couldn't sync this design. Try again in a moment.";

const syncThenLoad = async (projectId: string, syncNow: () => Promise<CloudSyncOutcome>): Promise<void> => {
  shareBusySignal.value = true;
  const outcome = await syncNow();
  shareBusySignal.value = false;
  shareNeedsProSignal.value = outcome === "needs_pro";
  if (outcome === "needs_pro") {
    shareErrorSignal.value = null;
    return;
  }
  if (outcome !== "saved") {
    shareErrorSignal.value = SYNC_FAILED_MESSAGE;
    return;
  }
  shareErrorSignal.value = null;
  await loadShareLink(projectId);
};

export const ShareDialog: React.FC<ShareDialogProps> = ({ projectId, syncNow, onClose }) => {
  const status = useSignalValue(shareStatusSignal);
  const link = useSignalValue(shareLinkSignal);
  const busy = useSignalValue(shareBusySignal);
  const error = useSignalValue(shareErrorSignal);
  const draft = useSignalValue(shareDraftSignal);
  const needsPro = useSignalValue(shareNeedsProSignal);

  useEffect(() => {
    resetShareDialog();
    void loadShareLink(projectId);
  }, [projectId]);

  return (
    <ShareDialogFrame title="Share" description="Send a link so others can look through your pages or leave comments." onClose={onClose}>
      {status === "loading" && (
        <div className="flex items-center gap-2 py-6 text-[12px] text-[var(--s-text-muted)]">
          <Spinner size={12} /> Checking this design
        </div>
      )}
      {status === "local" && <ShareSyncNotice onSyncNow={() => syncThenLoad(projectId, syncNow)} />}
      {status === "error" && (
        <Button variant="secondary" size="sm" onClick={() => void loadShareLink(projectId)}>
          Try again
        </Button>
      )}
      {status === "ready" && link && <ShareLinkField projectId={projectId} link={link} busy={busy} />}
      {status === "ready" && (
        <ShareSettingsForm
          settings={settingsOf(link, draft)}
          disabled={busy}
          onChange={(settings) => void applyShareSettings(projectId, settings)}
        />
      )}
      {status === "ready" && !link && (
        <Button variant="primary" size="md" fullWidth loading={busy} leftIcon={<Link2 size={13} />} onClick={() => void createShareLink(projectId)}>
          Create link
        </Button>
      )}
      {needsPro && <ShareNeedsProMessage />}
      {error && <p role="alert" className="text-[12px] text-red-600">{error}</p>}
    </ShareDialogFrame>
  );
};
