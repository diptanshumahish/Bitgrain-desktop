import React from "react";
import { Plus, Crop, Columns2, Undo2, Redo2, Trash2, Upload, Brush, Palette } from "lucide-react";
import { emitModal } from "../../lib/event-bus";
import { canUndoSignal, canRedoSignal, undoHistory, redoHistory } from "../../store/history-store";
import { imageSignal } from "../../store/image-store";
import { useSignalValue } from "../../lib/signal";
import { useBTGImport } from "../../hooks/useBTGImport";
import {
  lutIdSignal,
  hazeIntensitySignal,
  bloomIntensitySignal,
  bloomThresholdSignal,
  hazeWarmthSignal,
  applySnapshot,
  captureSnapshot,
} from "../../store/transform-store";
import { PALETTES } from "../../engine/palettes";
import type { BTGImageEditorProject } from "../../utils/btg-export";
import { IMAGE_ACCEPT } from "../../pages/home-page/accept-formats";

interface CanvasToolbarProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  compareMode: boolean;
  onToggleCompare: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onImageUpload,
  onClear,
  compareMode,
  onToggleCompare,
}) => {
  const hasImage = !!useSignalValue(imageSignal);
  const canUndo = useSignalValue(canUndoSignal);
  const canRedo = useSignalValue(canRedoSignal);
  const { importBTG } = useBTGImport();

  const handleBTGImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const project = await importBTG(file);
    if (!project || project.type !== "image-editor") return;

    const p = project as BTGImageEditorProject;
    imageSignal.value = p.image;

    const palette = PALETTES.find((pal) => pal.id === p.effects.palette?.id) ?? null;
    const snap = captureSnapshot();
    applySnapshot({
      ...snap,
      modes: p.effects.modes as unknown as typeof snap.modes,
      ditherMethod: p.effects.ditherMethod as unknown as typeof snap.ditherMethod,
      ditherFactor: p.effects.ditherFactor,
      resolution: p.effects.resolution,
      contrast: p.effects.contrast,
      brightness: p.effects.brightness,
      saturation: p.effects.saturation,
      grain: p.effects.grain,
      hue: p.effects.hue,
      isColor: p.effects.isColor,
      palette,
    });
    lutIdSignal.value = p.effects.lutId;
    hazeIntensitySignal.value = p.effects.hazeIntensity;
    bloomIntensitySignal.value = p.effects.bloomIntensity;
    bloomThresholdSignal.value = p.effects.bloomThreshold;
    hazeWarmthSignal.value = p.effects.hazeWarmth as unknown as typeof snap.hazeWarmth;
  };

  return (
    <div className="hidden md:flex absolute top-5 left-5 z-40 items-center gap-1 bg-[var(--s-bg-panel)]/90 backdrop-blur-xl rounded-full border border-black/5 dark:border-white/10 px-2 py-1.5 font-editorial">
      <label
        title="Upload image"
        className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)] transition-all active:scale-95"
      >
        <Plus size={14} strokeWidth={2.5} />
        <input type="file" className="hidden" onChange={onImageUpload} accept={IMAGE_ACCEPT} />
      </label>

      <label
        title="Load .BTG project"
        className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)] transition-all active:scale-95"
      >
        <Upload size={14} strokeWidth={2.5} />
        <input type="file" className="hidden" onChange={handleBTGImport} accept=".btg,application/json" />
      </label>

      <IconButton
        icon={<Crop size={14} strokeWidth={2} />}
        title="Crop"
        disabled={!hasImage}
        onClick={() => emitModal({ type: "crop" })}
      />
      <IconButton
        icon={<Brush size={14} strokeWidth={2} />}
        title="Brush effect"
        disabled={!hasImage}
        onClick={() => emitModal({ type: "selective-effect" })}
      />
      <IconButton
        icon={<Palette size={14} strokeWidth={2} />}
        title="Color studio"
        disabled={!hasImage}
        onClick={() => emitModal({ type: "color-studio" })}
      />
      <IconButton
        icon={<Columns2 size={14} strokeWidth={2} />}
        title="Compare"
        active={compareMode}
        disabled={!hasImage}
        onClick={onToggleCompare}
      />

      <div className="w-px h-4 bg-[var(--s-border)] mx-1 shrink-0" />

      <IconButton
        icon={<Undo2 size={14} strokeWidth={2} />}
        title="Undo"
        disabled={!canUndo}
        onClick={undoHistory}
      />
      <IconButton
        icon={<Redo2 size={14} strokeWidth={2} />}
        title="Redo"
        disabled={!canRedo}
        onClick={redoHistory}
      />

      <div className="w-px h-4 bg-[var(--s-border)] mx-1 shrink-0" />

      <IconButton
        icon={<Trash2 size={14} strokeWidth={2} />}
        title="Clear"
        disabled={!hasImage}
        onClick={onClear}
      />
    </div>
  );
};

interface IconButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, title, onClick, active, disabled }) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all active:scale-95 ${
      active ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]" : "text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)]"
    } ${disabled ? "opacity-25 cursor-not-allowed pointer-events-none" : "cursor-pointer"}`}
  >
    {icon}
  </button>
);
