import React from "react";
import { useSignalValue } from "../../../../lib/signal";
import { currentProjectSignal } from "../../store/project-store";
import {
  perfHudVisibleSignal,
  previewFpsSignal,
  previewFrameMsSignal,
  previewScaleSignal,
  previewQualitySignal,
} from "../../store/preview-perf-store";
import { poolBusySignal, poolSizeSignal } from "../../engine/preview/preview-pool";
import { cacheStatsSignal } from "../../engine/preview/render-cache";
import { prerenderActiveSignal } from "../../engine/preview/prerender";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${Math.round(mb)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

const Row: React.FC<{ label: string; value: string; tone?: "ok" | "warn" }> = ({
  label,
  value,
  tone,
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <span className="text-white/45">{label}</span>
    <span
      className={
        tone === "warn"
          ? "tabular-nums text-amber-300"
          : tone === "ok"
            ? "tabular-nums text-emerald-300"
            : "tabular-nums text-white/85"
      }
    >
      {value}
    </span>
  </div>
);

// The preview's instrument panel. Off by default, toggled from the preview
// controls or with `\`. It exists because the whole point of the desktop render
// path is that it uses the machine, and that claim should be visible rather than
// asserted.
export const PerfHud: React.FC = () => {
  const visible = useSignalValue(perfHudVisibleSignal);
  const project = useSignalValue(currentProjectSignal);
  const fps = useSignalValue(previewFpsSignal);
  const frameMs = useSignalValue(previewFrameMsSignal);
  const scale = useSignalValue(previewScaleSignal);
  const quality = useSignalValue(previewQualitySignal);
  const busy = useSignalValue(poolBusySignal);
  const poolSize = useSignalValue(poolSizeSignal);
  const cache = useSignalValue(cacheStatsSignal);
  const prerendering = useSignalValue(prerenderActiveSignal);

  if (!visible || !project) return null;

  const targetFps = project.fps || 30;
  const procWidth = Math.round(project.width * scale);
  const procHeight = Math.round(project.height * scale);
  const lookups = cache.hits + cache.misses;
  const hitRate = lookups > 0 ? Math.round((cache.hits / lookups) * 100) : 0;

  return (
    <div className="absolute top-2 left-2 z-20 rounded-md border border-white/10 bg-black/70 px-2.5 py-2 font-mono text-[10px] leading-[1.6] backdrop-blur-sm min-w-[168px] pointer-events-none">
      <Row
        label="fps"
        value={`${fps} / ${targetFps}`}
        tone={fps >= targetFps - 1 ? "ok" : fps > 0 ? "warn" : undefined}
      />
      <Row label="frame" value={`${frameMs.toFixed(1)} ms`} />
      <Row
        label="render"
        value={`${procWidth}×${procHeight}${quality === "auto" ? "" : " ·fixed"}`}
      />
      <Row
        label="workers"
        value={`${busy} / ${poolSize}`}
        tone={busy > 0 ? "ok" : undefined}
      />
      <Row label="cache" value={`${cache.frames}f · ${formatBytes(cache.bytes)}`} />
      <Row label="hit rate" value={`${hitRate}%`} />
      {prerendering && (
        <div className="mt-1 flex items-center gap-1.5 text-emerald-300/90">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span>pre-rendering</span>
        </div>
      )}
    </div>
  );
};
