import React from "react";
import { useSignalValue } from "../../../../lib/signal";
import {
  exportPanelOpenSignal,
  exportProgressSignal,
  exportQualitySignal,
  exportBitratePresetSignal,
  resetExportProgress,
} from "../../engine/exporter/export-types";
import {
  startMediaRecorderExport,
  cancelMediaRecorderExport,
} from "../../engine/exporter/recorder-exporter";
import {
  startWebCodecsExport,
  cancelWebCodecsExport,
  isWebCodecsSupported,
} from "../../engine/exporter/webcodecs-exporter";
import {
  buildH264Codec,
  defaultBitrateBps,
  describeH264Level,
  estimateOutputBytes,
  formatBitrateLabel,
  formatBytesLabel,
  type BitratePreset,
} from "../../engine/exporter/codec-config";
import { currentProjectSignal } from "../../store/project-store";
import { updateProjectSettings } from "../../utils/edit-ops";
import { FPS_PRESETS, RESOLUTION_PRESETS } from "../../constants";
import { Modal } from "../Modal";
import { ExportSummaryCard } from "./ExportSummaryCard";
import { ExportProgressBar } from "./ExportProgressBar";
import { SelectMenu } from "../ui/SelectMenu";
import { trackEvent } from "../../../../lib/tracker";
import { useUser } from "../../../../hooks/useUser";
import { maxVideoShortEdge } from "../../engine/exporter/export-plan-gate";
import { emitModal } from "../../../../lib/event-bus";

const BITRATE_PRESETS: { id: BitratePreset; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "ultra", label: "Ultra" },
];

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const mm = Math.floor(total / 60).toString().padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
}: SegmentedProps<T>): React.ReactElement {
  return (
    <div className="flex gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`flex-1 py-2 rounded-md text-[11px] font-mono font-bold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              active
                ? "bg-[var(--s-text)] text-[var(--s-bg-panel)] border-[var(--s-text)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] border-[var(--s-border)] hover:text-[var(--s-text)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const ExportPanel: React.FC = () => {
  const open = useSignalValue(exportPanelOpenSignal);
  const project = useSignalValue(currentProjectSignal);
  const progress = useSignalValue(exportProgressSignal);
  const quality = useSignalValue(exportQualitySignal);
  const bitratePreset = useSignalValue(exportBitratePresetSignal);
  const { credits } = useUser();
  const plan = credits.plan;
  const maxShortEdge = maxVideoShortEdge(plan);

  if (!project) return null;

  const webCodecsAvailable = isWebCodecsSupported();
  const close = (): void => {
    exportPanelOpenSignal.value = false;
  };

  const isBusy =
    progress.status === "preparing" ||
    progress.status === "recording" ||
    progress.status === "finalizing";

  const useMp4 = quality === "frame-perfect-mp4" && webCodecsAvailable;

  const handleStart = (): void => {
    resetExportProgress();
    trackEvent("video", "export_started", {
      details: { quality, bitrate: bitratePreset, name: project.name },
    });
    if (useMp4) startWebCodecsExport(plan);
    else startMediaRecorderExport(plan);
  };

  const handleCancel = (): void => {
    if (useMp4) cancelWebCodecsExport();
    else cancelMediaRecorderExport();
  };

  const evenWidth = Math.floor(project.width / 2) * 2;
  const evenHeight = Math.floor(project.height / 2) * 2;
  const codecLabel = useMp4
    ? describeH264Level(evenWidth, evenHeight, project.fps)
    : "VP9 / Opus (WebM)";
  const bitrateBps = defaultBitrateBps(
    evenWidth,
    evenHeight,
    project.fps,
    bitratePreset,
  );
  const estimatedBytes = estimateOutputBytes(bitrateBps, project.duration);
  const codecString = useMp4
    ? buildH264Codec(evenWidth, evenHeight, project.fps)
    : "vp9";

  const resolutionValue = `${project.width}x${project.height}`;

  return (
    <Modal isOpen={open} onClose={close}>
      <div className="p-7 flex flex-col gap-5 bg-[var(--s-bg-panel)] text-[var(--s-text)] border border-[var(--s-border)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold leading-tight   flex items-center gap-2">
              <span className="font-mono text-[var(--s-accent)]">[&gt;&gt;]</span>
              Export
              <span className="text-[var(--s-text-subtle)] font-medium">
                {project.name || "Project"}
              </span>
            </h2>
            <p className="text-[11px] text-[var(--s-text-subtle)] mt-1">
              Tune resolution, frame rate and bitrate before rendering.
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close export panel"
            className="w-8 h-8 rounded-md border border-[var(--s-border)] flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] font-mono font-bold text-[14px] leading-none"
          >
            [x]
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-[var(--s-text-muted)]">
              Project Name
            </label>
            <input
              type="text"
              placeholder="Untitled video"
              value={project.name}
              onChange={(event) =>
                updateProjectSettings({ name: event.target.value })
              }
              className="w-full px-3 py-2.5 bg-[var(--s-bg-input)] border border-[var(--s-border)] rounded-md text-[12px] text-[var(--s-text)] focus:outline-none focus:border-[var(--s-accent)] transition-colors placeholder:text-[var(--s-text-subtle)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-[var(--s-text-muted)]">
              Resolution
            </label>
            <SelectMenu
              value={resolutionValue}
              ariaLabel="Resolution"
              onChange={(next) => {
                const [width, height] = next.split("x").map(Number);
                if (Math.min(width, height) > maxShortEdge) {
                  emitModal({ type: "studio-payment" });
                  return;
                }
                updateProjectSettings({ width, height });
              }}
              options={RESOLUTION_PRESETS.map((res) => {
                const locked = Math.min(res.width, res.height) > maxShortEdge;
                return {
                  value: `${res.width}x${res.height}`,
                  label: `${res.label} (${res.width}x${res.height})${locked ? " · pro" : ""}`,
                };
              })}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-[var(--s-text-muted)]">
              Frame Rate (FPS)
            </label>
            <Segmented
              value={project.fps}
              onChange={(fps) => updateProjectSettings({ fps })}
              options={FPS_PRESETS.map((fps) => ({
                value: fps,
                label: String(fps),
              }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-[var(--s-text-muted)]">
              Format
            </label>
            <Segmented
              value={useMp4 ? "mp4" : "webm"}
              onChange={(next) => {
                exportQualitySignal.value =
                  next === "mp4" ? "frame-perfect-mp4" : "realtime-webm";
              }}
              options={[
                { value: "mp4", label: "MP4 H.264", disabled: !webCodecsAvailable },
                { value: "webm", label: "WebM" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-[var(--s-text-muted)]">
                Bitrate
              </label>
              <span className="text-[10px] font-mono text-[var(--s-text-subtle)]">
                {formatBitrateLabel(bitrateBps)}
              </span>
            </div>
            <Segmented
              value={bitratePreset}
              onChange={(preset) => (exportBitratePresetSignal.value = preset)}
              options={BITRATE_PRESETS.map((preset) => ({
                value: preset.id,
                label: preset.label,
              }))}
            />
          </div>
        </div>

        <ExportSummaryCard
          duration={formatDuration(project.duration)}
          width={evenWidth}
          height={evenHeight}
          codecLabel={codecLabel}
          codecString={codecString}
          estimatedSize={formatBytesLabel(estimatedBytes)}
        />

        {(isBusy ||
          progress.status === "done" ||
          progress.status === "error") && (
          <ExportProgressBar progress={progress} isBusy={isBusy} />
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--s-border)]">
          <button
            onClick={close}
            className="px-5 py-2 rounded-md border border-[var(--s-border)] text-[12px] font-mono font-bold text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          >
            Cancel
          </button>
          {progress.status === "done" && progress.downloadUrl ? (
            <a
              href={progress.downloadUrl}
              download={progress.fileName}
              onClick={() =>
                trackEvent("video", "export_downloaded", {
                  details: { name: progress.fileName },
                })
              }
              className="px-5 py-2 rounded-md bg-[var(--s-text)] text-[var(--s-bg-panel)] text-[12px] font-mono font-bold flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <span aria-hidden className="leading-none">[v]</span>
              Download
            </a>
          ) : isBusy ? (
            <button
              onClick={handleCancel}
              className="px-5 py-2 rounded-md bg-red-500 text-white text-[12px] font-mono font-bold hover:bg-red-600 transition-colors"
            >
              Stop Render
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-5 py-2 rounded-md bg-[var(--s-text)] text-[var(--s-bg-panel)] text-[12px] font-mono font-bold flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <span aria-hidden className="leading-none">[&gt;&gt;]</span>
              Start Export
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
