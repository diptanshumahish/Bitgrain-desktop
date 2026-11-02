import React, { useRef } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { buildShareUrl } from "../api/share-links-api";
import type { ShareLink } from "../api/share-types";
import { describeExpiry } from "./share-expiry";
import { regenerateLink, turnOffLink } from "./share-dialog-actions";
import { scrambleText } from "@bitgrain/ui/motion/scramble/scramble-text";

const COPY_LABEL = "Copy link";
const COPIED_LABEL = "Copied";
const LABEL_RESET_MS = 1600;

interface ShareLinkFieldProps {
  projectId: string;
  link: ShareLink;
  busy: boolean;
}

const showCopied = (label: HTMLSpanElement | null): void => {
  if (!label) return;
  scrambleText(label, COPIED_LABEL);
  window.setTimeout(() => scrambleText(label, COPY_LABEL), LABEL_RESET_MS);
};

const copyLink = async (url: string, label: HTMLSpanElement | null): Promise<void> => {
  try {
    await navigator.clipboard.writeText(url);
    showCopied(label);
  } catch (error) {
    console.error("clipboard write failed:", error);
    emitStatusToast({ title: "We couldn't copy the link.", detail: "Your browser blocked clipboard access. Select the link and copy it." });
  }
};

const confirmRegenerate = (projectId: string, link: ShareLink): void => {
  emitDialog({
    type: "confirm",
    title: "Make a new link?",
    message: "The current link stops working right away. Anyone you shared it with will need the new one.",
    confirmLabel: "Make new link",
    onConfirm: () => void regenerateLink(projectId, { access: link.access, allowDownload: link.allowDownload, expiresAt: link.expiresAt }),
  });
};

const confirmTurnOff = (projectId: string): void => {
  emitDialog({
    type: "confirm",
    title: "Turn off this link?",
    message: "People with the link won't be able to open your design anymore. Comments stay with the project.",
    confirmLabel: "Turn off",
    danger: true,
    onConfirm: () => void turnOffLink(projectId),
  });
};

export const ShareLinkField: React.FC<ShareLinkFieldProps> = ({ projectId, link, busy }) => {
  const url = buildShareUrl(link.token);
  const labelRef = useRef<HTMLSpanElement>(null);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          aria-label="Share link"
          onFocus={(event) => event.currentTarget.select()}
          className="flex-1 min-w-0 h-8 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] px-2 text-[12px] text-[var(--s-text)] outline-none"
        />
        <Button variant="primary" size="sm" leftIcon={<Copy size={12} />} onClick={() => void copyLink(url, labelRef.current)}>
          <span ref={labelRef}>{COPY_LABEL}</span>
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <span className="flex-1 text-[11.5px] text-[var(--s-text-muted)]">{describeExpiry(link.expiresAt)}</span>
        <Button variant="ghost" size="xs" disabled={busy} leftIcon={<RefreshCw size={11} />} onClick={() => confirmRegenerate(projectId, link)}>
          New link
        </Button>
        <Button variant="ghost" size="xs" disabled={busy} onClick={() => confirmTurnOff(projectId)}>
          Turn off
        </Button>
      </div>
    </div>
  );
};
