import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { TOAST_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";
import { onAnnouncements } from "../announcement-events";
import { announcementQueueSignal, dismissCurrentAnnouncement, enqueueAnnouncements } from "../announcement-store";
import { watchAnnouncements } from "../watch-announcements";
import { AnnouncementCta } from "./announcement-cta";

const EDITOR_PATH = "/editor";
const CLEAN_OUTPUT_PATH = "/live/output";
const EDITOR_POSITION = "bottom-[188px] right-3 md:bottom-[76px] md:right-6";
const DEFAULT_POSITION = "bottom-[76px] right-6";

export const AnnouncementPortal: React.FC = () => {
  const queue = useSignalValue(announcementQueueSignal);
  const { pathname } = useLocation();

  useEffect(() => onAnnouncements(enqueueAnnouncements), []);
  useEffect(() => watchAnnouncements(), []);

  const current = queue[0];
  if (!current || pathname.startsWith(CLEAN_OUTPUT_PATH)) return null;

  const position = pathname.startsWith(EDITOR_PATH) ? EDITOR_POSITION : DEFAULT_POSITION;
  const remaining = queue.length - 1;

  return createPortal(
    <div
      key={current.id}
      role="status"
      aria-live="polite"
      className={`fixed ${position} ${TOAST_LAYER} w-[min(300px,calc(100vw-24px))] font-editorial export-slide-in-right`}
    >
      <div className="flex flex-col gap-1 rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] px-3.5 py-3">
        <div className="flex items-start gap-2">
          <p className="flex-1 text-[13px] font-semibold leading-snug text-[var(--s-text)]">{current.title}</p>
          <button
            type="button"
            onClick={dismissCurrentAnnouncement}
            aria-label="Dismiss"
            className="-mr-1 -mt-0.5 p-0.5 text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
          >
            <X size={13} />
          </button>
        </div>
        {current.body && (
          <p className="whitespace-pre-line text-[12px] leading-relaxed text-[var(--s-text-muted)]">{current.body}</p>
        )}
        {(current.cta_url || remaining > 0) && (
          <div className="mt-1 flex items-center gap-3">
            {current.cta_label && current.cta_url && (
              <AnnouncementCta label={current.cta_label} url={current.cta_url} onFollow={dismissCurrentAnnouncement} />
            )}
            {remaining > 0 && (
              <button
                type="button"
                onClick={dismissCurrentAnnouncement}
                className="text-[12px] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
              >
                Next ({remaining})
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
