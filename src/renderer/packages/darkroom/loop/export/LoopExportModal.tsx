import React from "react";
import { X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { usePayment } from "@bitgrain/platform/billing/use-payment";
import { usePlanKnown } from "@bitgrain/platform/plans/gate/plan-status";
import { isPlainConversion } from "../../editor/export/plain-conversion/is-plain-conversion";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";
import { useEscapeClose } from "@bitgrain/ui/overlays/use-escape-close";
import {
  LOOP_FORMAT_LABELS, LOOP_FORMAT_OPTIONS, LOOP_FPS_OPTIONS, LOOP_MOTION_LABELS, LOOP_SECONDS_OPTIONS,
  loopSettingsSignal, updateLoopSettings,
} from "../loop-settings";
import { LOOP_MOTION_HINTS, loopSizeHint } from "../loop-copy";
import { useLoopMotion } from "../use-loop-motion";
import { LoopChoiceRow } from "./LoopChoiceRow";
import { LoopModalPreview } from "./LoopModalPreview";
import { LoopExportFooter } from "./LoopExportFooter";
import { loopExportStatusSignal } from "./loop-export-store";
import { runLoopExport } from "./run-loop-export";
import { soundSettingsSignal } from "../sound/sound-settings";
import { soundExportHint } from "../sound/sound-copy";
import { soundTrackSignal } from "../sound/track/sound-track-store";
import { useSoundDrive } from "../sound/use-sound-drive";
import { SoundSection } from "../sound/ui/SoundSection";
import { SoundModalPreview } from "../sound/preview/SoundModalPreview";
import { runSoundLoopExport } from "../sound/export/run-sound-loop-export";

interface LoopExportModalProps {
  onClose: () => void;
}

const CLOSE_ICON_SIZE = 15;
const NO_MOTION_HINT = "Add film grain, paper texture, dither, halftone or pop art first. Those are the looks that can move.";
const SECONDS_CHOICES = LOOP_SECONDS_OPTIONS.map((seconds) => ({ id: seconds, label: `${seconds}s` }));
const FPS_CHOICES = LOOP_FPS_OPTIONS.map((fps) => ({ id: fps, label: `${fps}` }));
const FORMAT_CHOICES = LOOP_FORMAT_OPTIONS.map((format) => ({ id: format, label: LOOP_FORMAT_LABELS[format] }));
const WATERMARK_BADGE = "With watermark";
const PRO_BADGE = "Pro";
const LOOP_SUBTITLE = "Your photo stays still while the texture keeps moving.";
const SOUND_SUBTITLE = "Your photo stays still while the look moves with your music.";

export const LoopExportModal: React.FC<LoopExportModalProps> = ({ onClose }) => {
  const settings = useSignalValue(loopSettingsSignal);
  const exporting = useSignalValue(loopExportStatusSignal) !== null;
  const { available, motion } = useLoopMotion();
  const sound = useSignalValue(soundSettingsSignal);
  const track = useSignalValue(soundTrackSignal);
  const { drive, drives } = useSoundDrive();
  const { credits } = usePayment();
  const planKnown = usePlanKnown();
  const isFree = planKnown && credits.plan === "free";
  const showsWatermark = isFree && !isPlainConversion();
  const soundTrack = sound.enabled ? track : null;
  const motionChoices = available.map((id) => ({ id, label: LOOP_MOTION_LABELS[id] }));
  useEscapeClose(!exporting, onClose);

  const handleExport = async (): Promise<void> => {
    if (!motion) return;
    const done = soundTrack
      ? await runSoundLoopExport({ motion, drive, fps: settings.fps, format: settings.format, settings: sound, track: soundTrack })
      : await runLoopExport(settings, motion);
    if (done) onClose();
  };

  const loopBadge = showsWatermark ? WATERMARK_BADGE : null;

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.5)] backdrop-blur-[3px] animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && !exporting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="loop-export-title"
        className="w-full max-w-[680px] max-h-[92dvh] flex flex-col md:flex-row overflow-y-auto rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] font-editorial animate-in fade-in zoom-in-95 duration-200"
      >
        {motion && soundTrack && <SoundModalPreview motion={motion} fps={settings.fps} drive={drive} track={soundTrack} />}
        {motion && !soundTrack && <LoopModalPreview motion={motion} fps={settings.fps} />}
        <div className="flex-1 min-w-0 flex flex-col pb-4 px-3">
          <div className="flex items-start justify-between gap-4 px-2 pt-5 pb-3">
            <div className="flex flex-col gap-0.5">
              <h2 id="loop-export-title" className="m-0 text-[15px] font-semibold text-[var(--s-text)]">Animated loop</h2>
              <p className="m-0 text-[12px] text-[var(--s-text-muted)]">{soundTrack ? SOUND_SUBTITLE : LOOP_SUBTITLE}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={exporting}
              aria-label="Close animated loop"
              className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors disabled:opacity-40"
            >
              <X size={CLOSE_ICON_SIZE} strokeWidth={1.75} />
            </button>
          </div>

          {motion ? (
            <div className="flex flex-col gap-1">
              <LoopChoiceRow label="Motion" choices={motionChoices} value={motion} disabled={exporting} onChange={(value) => updateLoopSettings({ motion: value })} />
              <p className="m-0 px-2 pb-1 text-[12px] text-[var(--s-text-subtle)]">{LOOP_MOTION_HINTS[motion]}</p>
              <LoopChoiceRow label="Format" choices={FORMAT_CHOICES} value={settings.format} disabled={exporting} onChange={(value) => updateLoopSettings({ format: value })} />
              {settings.format === "mp4" && !sound.enabled && (
                <LoopChoiceRow label="Length" choices={SECONDS_CHOICES} value={settings.seconds} disabled={exporting} onChange={(value) => updateLoopSettings({ seconds: value })} />
              )}
              <LoopChoiceRow label="Frames per second" choices={FPS_CHOICES} value={settings.fps} disabled={exporting} onChange={(value) => updateLoopSettings({ fps: value })} />
              <SoundSection format={settings.format} drive={drive} drives={drives} disabled={exporting} />
            </div>
          ) : (
            <p className="m-0 px-2 text-[12px] text-[var(--s-text-muted)]">{NO_MOTION_HINT}</p>
          )}

          <LoopExportFooter
            format={settings.format}
            sizeHint={soundTrack ? soundExportHint(isFree, settings.format) : loopSizeHint(settings.format, showsWatermark)}
            badge={soundTrack ? (isFree ? PRO_BADGE : null) : loopBadge}
            canExport={motion !== null && (!sound.enabled || soundTrack !== null)}
            onExport={() => void handleExport()}
          />
        </div>
      </div>
    </div>
  );
};
