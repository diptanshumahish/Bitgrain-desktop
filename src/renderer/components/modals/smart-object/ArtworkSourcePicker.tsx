import React, { useRef } from "react";
import { Image as ImageIcon, Layers, Upload } from "lucide-react";
import type { ArtworkSourceKind } from "./artwork-source";
import type { Layer } from "../../../data/studioTypes";
import { trackEvent } from "../../../lib/tracker";

interface ArtworkSourcePickerProps {
  dark: boolean;
  active: ArtworkSourceKind;
  selectedLayer: Layer | null;
  onPickDesign: () => void;
  onPickLayer: () => void;
  onPickUpload: (file: File) => void;
}

interface SourceOption {
  kind: ArtworkSourceKind;
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  hint?: string;
}

export const ArtworkSourcePicker: React.FC<ArtworkSourcePickerProps> = ({
  dark,
  active,
  selectedLayer,
  onPickDesign,
  onPickLayer,
  onPickUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const options: SourceOption[] = [
    { kind: "design", label: "whole design", icon: <ImageIcon size={14} strokeWidth={2} />, disabled: false },
    {
      kind: "layer",
      label: selectedLayer ? selectedLayer.name : "selected layer",
      icon: <Layers size={14} strokeWidth={2} />,
      disabled: !selectedLayer,
      hint: selectedLayer ? undefined : "select a layer on the canvas first",
    },
    { kind: "upload", label: "an image", icon: <Upload size={14} strokeWidth={2} />, disabled: false },
  ];

  const handlePick = (kind: ArtworkSourceKind): void => {
    trackEvent("studio", "mockup_artwork_source_chosen", { details: { kind } });
    if (kind === "design") onPickDesign();
    if (kind === "layer") onPickLayer();
    if (kind === "upload") fileInputRef.current?.click();
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) onPickUpload(file);
    event.target.value = "";
  };

  const idleClass = dark
    ? "border-white/10 text-zinc-400 hover:border-white/25"
    : "border-zinc-200 text-zinc-600 hover:border-zinc-400";
  const activeClass = dark ? "border-[#820000] text-white" : "border-[#820000] text-zinc-900";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">place</span>
      <div className="flex flex-col gap-1.5">
        {options.map((option) => (
          <button
            key={option.kind}
            onClick={() => handlePick(option.kind)}
            disabled={option.disabled}
            title={option.hint ?? option.label}
            className={`flex items-center gap-2 h-9 px-2.5 rounded-lg border text-[12px] text-left truncate ${option.disabled ? "opacity-35 cursor-not-allowed" : ""} ${active === option.kind ? activeClass : idleClass}`}
          >
            {option.icon}
            <span className="truncate">{option.label}</span>
          </button>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};
