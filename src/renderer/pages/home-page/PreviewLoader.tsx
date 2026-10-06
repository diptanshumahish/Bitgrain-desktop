import type { ReactElement } from "react";
import { useSignalValue } from "../../lib/signal";
import { previewLoadingSignal } from "../../store/image-store";

export const PreviewLoader = (): ReactElement | null => {
  const loading = useSignalValue(previewLoadingSignal);
  if (!loading) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-56 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-zinc-800 dark:bg-zinc-100 rounded-full preview-loader-bar" />
        </div>
        <span className="text-xs text-zinc-700 dark:text-zinc-200">
          processing image
        </span>
      </div>
    </div>
  );
};
