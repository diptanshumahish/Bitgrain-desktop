import React from "react";
import { X } from "lucide-react";
import { ChangeLogView } from "../changelog/ChangeLogView";
import { CHANGE_LOG, LATEST_VERSION } from "../../data/change-log";

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  const latest = CHANGE_LOG[0]?.version ?? LATEST_VERSION;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-editorial"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden"
        role="dialog"
        aria-label="Release notes"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-zinc-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                Release Notes
              </p>
              <span className="font-mono text-[10.5px] text-zinc-500 dark:text-zinc-500">
                v{latest}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
              Bitgrain, what changed and when
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 custom-scrollbar pt-3">
          <ChangeLogView />
        </div>

        <div className="px-5 py-3 border-t border-black/5 dark:border-zinc-800 shrink-0">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-600">
            Built by{" "}
            <a
              href="https://x.com/diptanshuSays"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors"
            >
              @diptanshuSays
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
