import React, { useRef } from "react";
import { Ban, Image as ImageIcon, PaintBucket, Upload, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  VectorLayer,
  VectorFillImage,
  VectorFillFit,
} from "../../../data/studioTypes";
import { ColorPicker } from "../ui/ColorPicker";
import { BtnGroup } from "../ui/panelPrimitives";
import { processImageFile } from "../../../utils/image-utils";
import { PanelGroup } from "../ui/panel-group";
import { HeaderIconButton } from "../ui/HeaderIconButton";

type FillMode = "none" | "color" | "image";

interface VectorFillSectionProps {
  layer: VectorLayer;
  pageImage: string | null;
  onChange: (updates: Partial<VectorLayer>) => void;
}

const DEFAULT_FIT: VectorFillFit = "cover";
const FIT_OPTIONS: { label: string; value: VectorFillFit }[] = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Stretch", value: "stretch" },
];

const MODE_BUTTONS: { mode: FillMode; Icon: LucideIcon; title: string }[] = [
  { mode: "none", Icon: Ban, title: "No fill" },
  { mode: "color", Icon: PaintBucket, title: "Color fill" },
  { mode: "image", Icon: ImageIcon, title: "Image fill" },
];

const resolveMode = (layer: VectorLayer): FillMode => {
  if (layer.fillImage) return "image";
  if (layer.fill === "transparent" || layer.fill === "none") return "none";
  return "color";
};

export const VectorFillSection: React.FC<VectorFillSectionProps> = ({
  layer,
  pageImage,
  onChange,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const mode = resolveMode(layer);

  const setMode = (next: FillMode): void => {
    if (next === "none") {
      onChange({ fill: "transparent", fillVar: undefined, fillImage: undefined });
      return;
    }
    if (next === "color") {
      const color = layer.fill === "transparent" || layer.fill === "none" ? "#ffffff" : layer.fill;
      onChange({ fill: color, fillImage: undefined });
      return;
    }
    if (pageImage && !layer.fillImage) {
      onChange({ fillImage: { src: pageImage, fit: DEFAULT_FIT } });
      return;
    }
    if (!layer.fillImage) {
      fileRef.current?.click();
    }
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await processImageFile(file);
      onChange({ fillImage: { src: dataUrl, fit: DEFAULT_FIT } });
    } catch (error) {
      console.error("Failed to process fill image:", error);
    }
  };

  const updateFillImage = (updates: Partial<VectorFillImage>): void => {
    if (!layer.fillImage) return;
    onChange({ fillImage: { ...layer.fillImage, ...updates } });
  };

  const clearImage = (): void => {
    onChange({ fillImage: undefined });
  };

  const modeButtons = MODE_BUTTONS.map(({ mode: buttonMode, Icon, title }) => (
    <HeaderIconButton key={buttonMode} title={title} active={mode === buttonMode} onClick={() => setMode(buttonMode)}>
      <Icon size={13} strokeWidth={1.75} />
    </HeaderIconButton>
  ));

  return (
    <PanelGroup title="Fill" actions={modeButtons}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {mode === "color" && (
        <div>
          <ColorPicker
            color={layer.fill}
            varId={layer.fillVar}
            onChange={(c) => onChange({ fill: c, fillVar: undefined })}
            onBindVariable={(id, value) => onChange({ fill: value, fillVar: id })}
          />
        </div>
      )}

      {mode === "image" && (
        <div className="flex flex-col gap-2">
          {layer.fillImage ? (
            <div className="relative w-full aspect-square rounded-md border border-[var(--s-border)] overflow-hidden bg-[var(--s-bg-input)]">
              <img
                src={layer.fillImage.src}
                alt="Fill preview"
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <button
                onClick={clearImage}
                className="absolute top-1 right-1 bg-black/60 text-white border-none rounded-full p-1 cursor-pointer hover:bg-black/80 transition-colors"
                aria-label="Remove fill image"
              >
                <X size={11} strokeWidth={2} />
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-1 left-1 right-1 bg-black/60 text-white border-none rounded-md py-1 text-[10px] font-medium cursor-pointer hover:bg-black/80 transition-colors"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 w-full aspect-square rounded-md border border-dashed border-[var(--s-border)] bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] cursor-pointer hover:text-[var(--s-text)] hover:border-[var(--s-text-subtle)] transition-colors"
            >
              <Upload size={16} strokeWidth={1.5} />
              <span className="text-[10px]">Choose image</span>
            </button>
          )}

          {pageImage && (!layer.fillImage || layer.fillImage.src !== pageImage) && (
            <button
              onClick={() => onChange({ fillImage: { src: pageImage, fit: layer.fillImage?.fit ?? DEFAULT_FIT } })}
              className="text-[10px] text-[var(--s-accent)] bg-transparent border border-[var(--s-accent)]/40 rounded-md py-1 cursor-pointer hover:bg-[var(--s-accent)]/10 transition-colors"
            >
              Use page image
            </button>
          )}

          {layer.fillImage && (
            <BtnGroup
              options={FIT_OPTIONS}
              value={layer.fillImage.fit}
              onChange={(value) => updateFillImage({ fit: value as VectorFillFit })}
            />
          )}
        </div>
      )}
    </PanelGroup>
  );
};
