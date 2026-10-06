import React from "react";
import { Loader, ImagePlus } from "lucide-react";
import { PRESETS } from "../../toolbar/popovers/PresetsPopover";
import type { Preset } from "../../toolbar/popovers/PresetsPopover";

type EffectSelection = "current" | string;

interface BatchEffectListProps {
  selectedEffect: EffectSelection;
  onSelectEffect: (effect: EffectSelection) => void;
  isGeneratingPreview: boolean;
  previewUrl: string | null;
  effectLabel: string;
  customPresets: Preset[];
}

export const BatchEffectList: React.FC<BatchEffectListProps> = ({
  selectedEffect,
  onSelectEffect,
  isGeneratingPreview,
  previewUrl,
  effectLabel,
  customPresets,
}) => (
  <div className="sm:w-52 sm:border-r border-b sm:border-b-0 border-zinc-100 p-4 flex flex-col gap-3 shrink-0">
    <p className="text-[10px] font-semibold text-zinc-400    ">Effect</p>

    <div className="flex flex-row sm:flex-col gap-0.5 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto sm:max-h-64 pb-1 sm:pb-0">
      <EffectButton
        label="Current settings"
        value="current"
        selected={selectedEffect}
        onClick={onSelectEffect}
      />
      <div className="hidden sm:block h-px bg-zinc-100 shrink-0" />
      {PRESETS.map((preset) => (
        <EffectButton
          key={preset.name}
          label={preset.name}
          value={preset.name}
          selected={selectedEffect}
          onClick={onSelectEffect}
          tag={preset.tag}
        />
      ))}
      {customPresets.length > 0 && (
        <>
          <div className="hidden sm:block h-px bg-zinc-100 shrink-0" />
          <p className="hidden sm:block text-[9px] font-semibold text-zinc-400     px-2.5 py-1">
            My presets
          </p>
          {customPresets.map((preset) => (
            <EffectButton
              key={preset.name}
              label={preset.name}
              value={preset.name}
              selected={selectedEffect}
              onClick={onSelectEffect}
              tag="★"
            />
          ))}
        </>
      )}
    </div>

    <div>
      <p className="text-[10px] font-semibold text-zinc-400     mb-2">
        Preview
      </p>
      <div className="aspect-square rounded-lg bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center relative">
        {isGeneratingPreview && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader size={16} className="text-zinc-400 animate-spin" />
          </div>
        )}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Effect preview"
            className="w-full h-full object-contain select-none rendering-pixelated"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-zinc-300">
            <ImagePlus size={18} strokeWidth={1.5} />
            <span className="text-[9px]">add image to preview</span>
          </div>
        )}
      </div>
      {previewUrl && (
        <p className="text-[9px] text-zinc-400 text-center mt-1">
          {effectLabel}
        </p>
      )}
    </div>
  </div>
);

interface EffectButtonProps {
  label: string;
  value: string;
  selected: string;
  onClick: (value: string) => void;
  tag?: string;
}

const EffectButton: React.FC<EffectButtonProps> = ({
  label,
  value,
  selected,
  onClick,
  tag,
}) => (
  <button
    onClick={() => onClick(value)}
    className={`flex items-center justify-between shrink-0 sm:shrink px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
      selected === value
        ? "bg-violet-50 text-violet-600 border border-violet-200"
        : "text-zinc-500 hover:bg-zinc-50 border border-transparent"
    }`}
  >
    <span className="whitespace-nowrap">{label}</span>
    {tag && (
      <span className="hidden sm:block   text-[9px] text-zinc-300 ml-2 shrink-0">
        {tag}
      </span>
    )}
  </button>
);
