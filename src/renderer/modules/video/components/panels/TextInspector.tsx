import React, { useEffect } from "react";
import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { SelectMenu } from "../ui/SelectMenu";
import {
  currentProjectSignal,
  selectedClipIdSignal,
  updateProject,
} from "../../store/project-store";
import { useSignalValue } from "../../../../lib/signal";
import type { TextAlign, TextAnimation, TextClip, TextTrack } from "../../types";
import { ensureFontLoaded } from "../../utils/font-loader";
import {
  adminFontOptionsSignal,
  availableWeightsForFamily,
  ensureAdminFontsLoaded,
} from "../../../../lib/admin-fonts";
import { setClipFade } from "../../utils/clip-mutations";
import { maxFadeForClip } from "../../utils/clip-fade";
import { CLIP_FADE_STEP_SECONDS } from "../../constants";
import { ClipTimingControls } from "./ClipTimingControls";
import { TextStyleControls } from "./TextStyleControls";
import { FontUploadButton } from "./FontUploadButton";
import { deviceFontsSignal, deviceFontValue } from "../../utils/device-fonts";
import {
  ANIMATION_OPTIONS,
  FONT_GROUPS,
  fontExistsInLibrary,
} from "./text-inspector-options";

const ALIGN_BUTTONS: {
  value: TextAlign;
  Icon: typeof AlignLeft;
  label: string;
}[] = [
  { value: "left", Icon: AlignLeft, label: "Align left" },
  { value: "center", Icon: AlignCenter, label: "Align center" },
  { value: "right", Icon: AlignRight, label: "Align right" },
];

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-[10px]  ">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-200 tabular-nums">
        {value}
        {unit ?? ""}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="studio-slider w-full"
    />
  </div>
);

function findTextClip(
  clipId: string,
): { track: TextTrack; clip: TextClip } | null {
  const project = currentProjectSignal.value;
  if (!project) return null;
  for (const track of project.tracks) {
    if (track.kind !== "text") continue;
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) return { track, clip };
  }
  return null;
}

function patchText(clipId: string, patch: Partial<TextClip>): void {
  updateProject((project) => {
    const tracks = project.tracks.map((track) => {
      if (track.kind !== "text") return track;
      if (!track.clips.some((c) => c.id === clipId)) return track;
      return {
        ...track,
        clips: track.clips.map((c) =>
          c.id === clipId ? { ...c, ...patch } : c,
        ),
      };
    });
    return { ...project, tracks };
  });
}

export const TextInspector: React.FC = () => {
  const project = useSignalValue(currentProjectSignal);
  const selectedId = useSignalValue(selectedClipIdSignal);
  const adminFonts = useSignalValue(adminFontOptionsSignal);
  const deviceFonts = useSignalValue(deviceFontsSignal);
  const clip =
    project && selectedId ? (findTextClip(selectedId)?.clip ?? null) : null;

  useEffect(() => {
    void ensureAdminFontsLoaded();
  }, []);

  const fontWeight = clip?.weight;
  const fontFamily = clip?.font;
  useEffect(() => {
    if (fontWeight !== undefined && fontFamily !== undefined) {
      ensureFontLoaded(fontWeight, fontFamily);
    }
  }, [fontWeight, fontFamily]);

  if (!clip || !selectedId) return null;
  const adminWeightOptions = availableWeightsForFamily(clip.font);
  const knownFont =
    fontExistsInLibrary(clip.font) ||
    adminFonts.some((font) => font.value === clip.font) ||
    deviceFonts.some((font) => deviceFontValue(font.family) === clip.font);
  const customFont = !knownFont;

  return (
    <div className="flex flex-col p-4 border-b border-[var(--s-border)] animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] text-[var(--s-accent)] mb-0.5">
            Typography
          </p>
          <h3 className="text-[13px] font-medium text-[var(--s-text)] truncate max-w-[180px]">
            {clip.text || "Empty Text"}
          </h3>
        </div>
        <button
          onClick={() => (selectedClipIdSignal.value = null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
          aria-label="Deselect"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <ClipTimingControls
          clipId={selectedId}
          trackStart={clip.trackStart}
          duration={clip.duration}
        />
        <textarea
          value={clip.text}
          onChange={(e) => patchText(selectedId, { text: e.target.value })}
          rows={2}
          className="w-full px-2 py-1.5 rounded-md bg-[var(--s-bg-input)] border border-[var(--s-border)] text-[11px] text-[var(--s-text)] resize-none focus:outline-none focus:border-[var(--s-accent)]"
          placeholder="Your text"
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-[var(--s-text-muted)]">Font</span>
          <SelectMenu
            value={clip.font}
            ariaLabel="Font"
            onChange={(next) => patchText(selectedId, { font: next })}
            options={[
              ...(customFont ? [{ value: clip.font, label: clip.font, group: "Custom" }] : []),
              ...deviceFonts.map((font) => ({
                value: deviceFontValue(font.family),
                label: font.family,
                group: "Device fonts",
              })),
              ...adminFonts.map((font) => ({ value: font.value, label: font.label, group: "Bitgrain fonts" })),
              ...FONT_GROUPS.flatMap((group) =>
                group.fonts.map((font) => ({
                  value: font.value,
                  label: font.label,
                  group: group.name,
                })),
              ),
            ]}
            className="w-full"
          />
          <FontUploadButton
            onUploaded={(fontValue) => patchText(selectedId, { font: fontValue })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[var(--s-text-muted)]">Animation</span>
          <SelectMenu
            value={clip.animation}
            ariaLabel="Animation"
            onChange={(next) =>
              patchText(selectedId, { animation: next as TextAnimation })
            }
            options={ANIMATION_OPTIONS.map((opt) => ({
              value: opt.id,
              label: opt.label,
            }))}
            className="w-full"
          />
        </div>

        <SliderRow
          label="Size"
          min={16}
          max={240}
          step={1}
          value={clip.size}
          unit="px"
          onChange={(v) => patchText(selectedId, { size: v })}
        />
        {adminWeightOptions ? (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[var(--s-text-muted)]">Weight</span>
            <SelectMenu
              value={String(clip.weight)}
              ariaLabel="Weight"
              onChange={(next) => patchText(selectedId, { weight: Number(next) })}
              options={adminWeightOptions}
              className="w-full"
            />
          </div>
        ) : (
          <SliderRow
            label="Weight"
            min={100}
            max={900}
            step={100}
            value={clip.weight}
            onChange={(v) => patchText(selectedId, { weight: v })}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-[var(--s-text-muted)]">Color</span>
          <input
            type="color"
            value={clip.color}
            onChange={(e) => patchText(selectedId, { color: e.target.value })}
            className="w-10 h-6 rounded cursor-pointer border border-[var(--s-border)] bg-transparent"
          />
        </div>

        <div className="pt-1 border-t border-white/5" />
        <TextStyleControls
          clip={clip}
          onChange={(patch) => patchText(selectedId, patch)}
        />
        <div className="pt-1 border-t border-white/5" />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--s-text-muted)]">Align</span>
          <div className="flex gap-1">
            {ALIGN_BUTTONS.map(({ value, Icon, label }) => (
              <button
                key={label}
                onClick={() => patchText(selectedId, { align: value })}
                aria-label={label}
                className={`w-7 h-6 rounded-md border flex items-center justify-center transition-colors ${
                  clip.align === value
                    ? "border-[var(--s-accent)] bg-[var(--s-accent-soft)] text-[var(--s-text)]"
                    : "border-[var(--s-border)] text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
                }`}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        </div>

        <SliderRow
          label="Position X"
          min={0}
          max={100}
          step={1}
          value={Math.round(clip.position.x * 100)}
          unit="%"
          onChange={(v) =>
            patchText(selectedId, {
              position: { ...clip.position, x: v / 100 },
            })
          }
        />
        <SliderRow
          label="Position Y"
          min={0}
          max={100}
          step={1}
          value={Math.round(clip.position.y * 100)}
          unit="%"
          onChange={(v) =>
            patchText(selectedId, {
              position: { ...clip.position, y: v / 100 },
            })
          }
        />

        <div className="pt-1 border-t border-white/5" />
        <SliderRow
          label="Fade In"
          min={0}
          max={maxFadeForClip(clip.duration)}
          step={CLIP_FADE_STEP_SECONDS}
          value={Math.round((clip.fadeIn ?? 0) * 100) / 100}
          unit="s"
          onChange={(v) => setClipFade(selectedId, "fadeIn", v)}
        />
        <SliderRow
          label="Fade Out"
          min={0}
          max={maxFadeForClip(clip.duration)}
          step={CLIP_FADE_STEP_SECONDS}
          value={Math.round((clip.fadeOut ?? 0) * 100) / 100}
          unit="s"
          onChange={(v) => setClipFade(selectedId, "fadeOut", v)}
        />
      </div>
    </div>
  );
};
