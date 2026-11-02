import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const SHARE_DIALOG_EVENT = "bg:share-dialog";

export interface ShareDialogRequest {
  projectId: string;
  syncNow: () => Promise<CloudSyncOutcome>;
}

const shareDialogChannel = createEventChannel<ShareDialogRequest | null>(SHARE_DIALOG_EVENT);

export const emitShareDialog = shareDialogChannel.emit;
export const onShareDialog = shareDialogChannel.on;

