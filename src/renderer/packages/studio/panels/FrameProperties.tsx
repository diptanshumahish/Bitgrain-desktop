import React from "react";
import { Link2 } from "lucide-react";
import { ColorPicker } from "../ui/ColorPicker";
import { ScrubField, Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { useAspectLocked, toggleAspectLock } from "../state/aspect-lock-store";
import { FRAME_PRESETS } from "@bitgrain/core/layout/frame-presets";
import { FramePreviewCard } from "./frame/frame-preview-card";
import { LayoutGridSection } from "./layout-grid/layout-grid-section";
import type { LayoutGrid } from "@bitgrain/studio-core/model/layout-grid-types";

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
  layoutGrids?: LayoutGrid[];
  onLayoutGridsChange?: (grids: LayoutGrid[]) => void;
  scaleContents?: boolean;
  onScaleContentsChange?: (scale: boolean) => void;
  children?: React.ReactNode;
  kind?: FrameKind;
}

type FrameKind = "page" | "frame";

const KIND_COPY: Record<FrameKind, { position: string; clip: string }> = {
  page: { position: "Position on canvas", clip: "Clip content to page" },
  frame: { position: "Position", clip: "Clip content to frame" },
};

const MIN_DIMENSION = 50;
const LOCK_ICON_SIZE = 13;
const LOCK_ICON_STROKE = 1.75;

const AspectLockButton: React.FC<{ locked: boolean }> = ({ locked }) => (
  <button
    type="button"
    onClick={toggleAspectLock}
    title={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
    aria-pressed={locked}
    className={`w-8 h-[28px] rounded-md border flex items-center justify-center transition-colors shrink-0 ${
      locked
        ? "border-[var(--s-accent)] text-[var(--s-accent)] bg-[var(--s-accent-soft)]"
        : "border-[var(--s-border)] text-[var(--s-text-muted)] hover:text-[var(--s-text)]"
    }`}
  >
    <Link2 size={LOCK_ICON_SIZE} strokeWidth={LOCK_ICON_STROKE} />
  </button>
);
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
  layoutGrids,
  onLayoutGridsChange,
  scaleContents = false,
  onScaleContentsChange,
  children,
  kind = "page",
}) => {
  const copy = KIND_COPY[kind];
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
          className="w-full px-2.5 h-8 rounded-md bg-[var(--s-bg-input)] text-[12px] text-[var(--s-text)] border border-[var(--s-border)] outline-none focus:border-[var(--s-accent)] transition-colors"
        />
      </PanelGroup>

      {kind === "page" && (
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
      )}

      <PanelGroup title="Background">
        <ColorPicker
          color={background}
          varId={backgroundVar}
          onChange={onBackgroundChange}
          onBindVariable={(varId, value) => onBackgroundBind?.(varId, value)}
        />
      </PanelGroup>

      <PanelGroup title="Size">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-2 flex-1">
            <ScrubField label="W" title="Page width" value={width} min={MIN_DIMENSION} onChange={handleW} />
            <ScrubField label="H" title="Page height" value={height} min={MIN_DIMENSION} onChange={handleH} />
          </div>
          <AspectLockButton locked={lockAspect} />
        </div>
      </PanelGroup>

      <PanelGroup title={copy.position}>
        <div className="grid grid-cols-2 gap-2">
          <ScrubField label="X" value={x} onChange={(value) => onMove(Math.round(value), y)} />
          <ScrubField label="Y" value={y} onChange={(value) => onMove(x, Math.round(value))} />
        </div>
      </PanelGroup>

      {children}

      {onClipChange && (
        <PanelGroup title={copy.clip} actions={<Toggle label={copy.clip} value={clip} onChange={onClipChange} />} />
      )}

      {onScaleContentsChange && (
        <PanelGroup title="Scale contents on resize" actions={<Toggle label="Scale contents on resize" value={scaleContents} onChange={onScaleContentsChange} />} />
      )}

      {onLayoutGridsChange && <LayoutGridSection grids={layoutGrids} onChange={onLayoutGridsChange} />}
    </div>
  );
};
