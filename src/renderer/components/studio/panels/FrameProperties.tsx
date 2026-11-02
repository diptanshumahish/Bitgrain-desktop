import React from "react";
import { Lock, Unlock } from "lucide-react";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField, Toggle } from "../ui/panelPrimitives";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { useAspectLocked, toggleAspectLock } from "../../../store/aspect-lock-store";
import { FRAME_PRESETS } from "../../../utils/frame-presets";
import { FramePreviewCard } from "./frame/frame-preview-card";

interface FramePropertiesProps {
  name: string;
  background: string;
  backgroundVar?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  clip: boolean;
  indexLabel?: string;
  namePlaceholder: string;
  onRename: (name: string) => void;
  onBackgroundChange: (color: string) => void;
  onBackgroundBind?: (varId: string, value: string) => void;
  onResize: (width: number, height: number) => void;
  onMove: (x: number, y: number) => void;
  onClipChange?: (clip: boolean) => void;
}

const MIN_DIMENSION = 50;
const CUSTOM_PRESET_VALUE = "custom";

const PRESET_OPTIONS = [
  { value: CUSTOM_PRESET_VALUE, label: "Custom size" },
  ...FRAME_PRESETS.map((preset) => ({ value: preset.id, label: preset.label, group: preset.group })),
];

export const FrameProperties: React.FC<FramePropertiesProps> = ({
  name,
  background,
  backgroundVar,
  width,
  height,
  x,
  y,
  clip,
  indexLabel,
  namePlaceholder,
  onRename,
  onBackgroundChange,
  onBackgroundBind,
  onResize,
  onMove,
  onClipChange,
}) => {
  const lockAspect = useAspectLocked();
  const ratio = width / height;

  const handleW = (value: number) => {
    const clamped = Math.max(MIN_DIMENSION, Math.round(value));
    onResize(clamped, lockAspect ? Math.round(clamped / ratio) : height);
  };

  const handleH = (value: number) => {
    const clamped = Math.max(MIN_DIMENSION, Math.round(value));
    onResize(lockAspect ? Math.round(clamped * ratio) : width, clamped);
  };

  const matchedPreset = FRAME_PRESETS.find(
    (preset) => preset.width === width && preset.height === height,
  );

  return (
    <div className="flex flex-col font-editorial">
      <FramePreviewCard
        width={width}
        height={height}
        background={background}
        caption={indexLabel ?? matchedPreset?.label ?? "Custom size"}
      />

      <PanelGroup title="Name">
        <input
          type="text"
          value={name}
          onChange={(event) => onRename(event.target.value)}
          placeholder={namePlaceholder}
          className="w-full px-2.5 h-8 rounded-md bg-[var(--s-bg-input)] text-[11.5px] text-[var(--s-text)] border border-[var(--s-border)] outline-none focus:border-[var(--s-accent)] transition-colors"
        />
      </PanelGroup>

      <PanelGroup title="Preset">
        <Dropdown
          value={matchedPreset?.id ?? CUSTOM_PRESET_VALUE}
          options={PRESET_OPTIONS}
          onChange={(value) => {
            const preset = FRAME_PRESETS.find((item) => item.id === value);
            if (preset) onResize(preset.width, preset.height);
          }}
        />
      </PanelGroup>

      <PanelGroup title="Background">
        <ColorPicker
          color={background}
          varId={backgroundVar}
          onChange={onBackgroundChange}
          onBindVariable={(varId, value) => onBackgroundBind?.(varId, value)}
        />
      </PanelGroup>

      <PanelGroup title="Size">
        <div className="flex items-center gap-1.5">
          <small className="text-[10px] text-[var(--s-text-subtle)] mr-auto">Proportions</small>
          <button
            type="button"
            onClick={toggleAspectLock}
            title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
            className={`w-6 h-6 rounded-md border-none cursor-pointer flex items-center justify-center shrink-0 transition-all duration-100 ${
              lockAspect
                ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-muted)]"
            }`}
          >
            {lockAspect ? <Lock size={11} /> : <Unlock size={11} />}
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <ScrubField label="W" value={width} min={MIN_DIMENSION} onChange={handleW} />
          <span className="text-[var(--s-text-subtle)] text-[11px] px-0.5">×</span>
          <ScrubField label="H" value={height} min={MIN_DIMENSION} onChange={handleH} />
        </div>
      </PanelGroup>

      <PanelGroup title="Position">
        <div className="grid grid-cols-2 gap-2">
          <ScrubField label="X" value={x} onChange={(value) => onMove(Math.round(value), y)} />
          <ScrubField label="Y" value={y} onChange={(value) => onMove(x, Math.round(value))} />
        </div>
      </PanelGroup>

      {onClipChange && (
        <PanelGroup title="Clip content to page" actions={<Toggle value={clip} onChange={onClipChange} />} />
      )}
    </div>
  );
};
