import React from "react";
import { Cpu, Database, Gauge, Activity } from "lucide-react";
import { useSignalValue } from "../../../lib/signal";
import { currentProjectSignal } from "../store/project-store";
import { activeToolSignal, TIMELINE_TOOLS } from "../store/tool-store";
import { isPlayingSignal, playbackRateSignal } from "../store/playback-store";
import {
  perfHudVisibleSignal,
  previewFpsSignal,
  previewQualitySignal,
  previewScaleSignal,
  droppedFrameCountSignal,
  setPreviewQuality,
  togglePerfHud,
  type PreviewQuality,
} from "../store/preview-perf-store";
import { poolBusySignal, poolSizeSignal } from "../engine/preview/preview-pool";
import { cacheStatsSignal } from "../engine/preview/render-cache";
import { prerenderActiveSignal } from "../engine/preview/prerender";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

const QUALITY_LABEL: Record<PreviewQuality, string> = {
  auto: "Auto",
  full: "Full",
  half: "1/2",
  quarter: "1/4",
};

const QUALITY_ORDER: PreviewQuality[] = ["auto", "full", "half", "quarter"];

const Cell: React.FC<{
  icon?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}> = ({ icon, children, title }) => (
  <div
    title={title}
    className="flex items-center gap-1.5 px-2.5 text-[10px] text-[var(--s-text-subtle)] whitespace-nowrap"
  >
    {icon}
    <span className="tabular-nums">{children}</span>
  </div>
);

const Divider: React.FC = () => (
  <div className="h-3 w-px bg-[var(--s-border)]" />
);

function formatMB(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

// The status bar. Format, tool, transport, and an honest readout of what the
// render path is doing: how many workers are busy, how much of the timeline is
// cached, whether the machine is holding real time. A desktop app should be able
// to answer "is it working hard or is it stuck" without a devtools panel.
export const StatusBar: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const tool = useSignalValue(activeToolSignal);
  const playing = useSignalValue(isPlayingSignal);
  const rate = useSignalValue(playbackRateSignal);
  const fps = useSignalValue(previewFpsSignal);
  const quality = useSignalValue(previewQualitySignal);
  const scale = useSignalValue(previewScaleSignal);
  const dropped = useSignalValue(droppedFrameCountSignal);
  const busy = useSignalValue(poolBusySignal);
  const poolSize = useSignalValue(poolSizeSignal);
  const cache = useSignalValue(cacheStatsSignal);
  const prerendering = useSignalValue(prerenderActiveSignal);
  const hudOn = useSignalValue(perfHudVisibleSignal);

  if (!project) return null;

  const toolLabel = TIMELINE_TOOLS.find((t) => t.id === tool)?.label ?? tool;
  const targetFps = project.fps || 30;
  const behind = playing && fps > 0 && fps < targetFps - 2;

  const cycleQuality = () => {
    const idx = QUALITY_ORDER.indexOf(quality);
    setPreviewQuality(QUALITY_ORDER[(idx + 1) % QUALITY_ORDER.length]);
  };

  return (
    <div className="h-6 shrink-0 flex items-center border-t border-[var(--s-border)] bg-[var(--s-bg-panel-alt)] px-1 select-none">
      <Cell title="Project format">
        {project.width}×{project.height} · {targetFps}p
      </Cell>
      <Divider />
      <Cell title="Active timeline tool (V, C, R, N, Y, U)">{toolLabel}</Cell>
      <Divider />
      <Cell
        icon={<Activity size={10} />}
        title={
          playing
            ? "Preview frame rate against the project's frame rate"
            : "Paused"
        }
      >
        <span className={behind ? "text-amber-400" : undefined}>
          {playing ? `${fps}/${targetFps} fps` : "paused"}
        </span>
        {playing && rate !== 1 ? (
          <span className="ml-1 text-[var(--s-accent)]">
            {rate > 0 ? `${rate}×` : `${Math.abs(rate)}× rev`}
          </span>
        ) : null}
      </Cell>
      {dropped > 0 && (
        <Cell title="Frames the preview could not deliver in real time">
          <span className="text-amber-400">{dropped} dropped</span>
        </Cell>
      )}

      <div className="flex-1" />

      <WorkspaceSwitcher />
      <Divider />

      <button
        onClick={cycleQuality}
        title="Preview render quality. Auto holds the frame rate by trading resolution; the others pin it."
        className="flex items-center gap-1.5 px-2.5 h-full text-[10px] text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
      >
        <Gauge size={10} />
        <span className="tabular-nums">
          {QUALITY_LABEL[quality]} · {Math.round(project.width * scale)}p wide
        </span>
      </button>
      <Divider />
      <Cell
        icon={<Cpu size={10} />}
        title={`${poolSize} render workers, ${busy} busy right now`}
      >
        <span className={busy > 0 ? "text-emerald-400" : undefined}>
          {busy}/{poolSize}
        </span>
      </Cell>
      <Divider />
      <Cell
        icon={<Database size={10} />}
        title="Frames held in the render cache, and what they cost in memory"
      >
        <span className={prerendering ? "text-emerald-400" : undefined}>
          {cache.frames}f · {formatMB(cache.bytes)}
        </span>
      </Cell>
      <Divider />
      <button
        onClick={togglePerfHud}
        title="Toggle the preview instrument panel (`)"
        className={`px-2.5 h-full text-[10px] transition-colors hover:bg-[var(--s-bg-input)] ${
          hudOn
            ? "text-[var(--s-accent)]"
            : "text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
        }`}
      >
        HUD
      </button>
    </div>
  );
};
