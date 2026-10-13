import React from "react";

interface RestoreToastProps {
  onRestore: () => void;
  onDismiss: () => void;
}

export const RestoreToast: React.FC<RestoreToastProps> = ({ onRestore, onDismiss }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6 px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl dark: animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-zinc-900 dark:text-white leading-none">
          Recover your last session?
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
          Found a previously saved workspace.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={onRestore}
          className="px-4 py-1.5 text-[11px] font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Restore work
        </button>
      </div>
    </div>
  );
};
