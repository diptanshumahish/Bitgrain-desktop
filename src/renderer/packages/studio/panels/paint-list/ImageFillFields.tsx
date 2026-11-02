import React, { useRef } from "react";
import { Upload } from "lucide-react";
import type { VectorFillFit, VectorFillImage } from "@bitgrain/studio-core/model/studio-types";
import { BtnGroup } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { processImageFile } from "@bitgrain/darkroom/editor/upload/image-utils";

const DEFAULT_FIT: VectorFillFit = "cover";
const FIT_OPTIONS: { label: string; value: VectorFillFit }[] = [
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Stretch", value: "stretch" },
];

interface ImageFillFieldsProps {
  image: VectorFillImage | undefined;
  pageImage: string | null;
  onChange: (image: VectorFillImage) => void;
}

export const ImageFillFields: React.FC<ImageFillFieldsProps> = ({ image, pageImage, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      onChange({ src: await processImageFile(file), fit: image?.fit ?? DEFAULT_FIT });
    } catch (error) {
      console.error("Failed to process fill image:", error);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative flex items-center justify-center gap-1.5 w-full h-16 rounded-md border border-dashed border-[var(--s-border)] bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] cursor-pointer overflow-hidden hover:text-[var(--s-text)] transition-colors"
      >
        {image ? (
          <img src={image.src} alt="Fill preview" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <>
            <Upload size={14} strokeWidth={1.5} />
            <span className="text-[12px]">Choose image</span>
          </>
        )}
      </button>
      {pageImage && image?.src !== pageImage && (
        <button
          type="button"
          onClick={() => onChange({ src: pageImage, fit: image?.fit ?? DEFAULT_FIT })}
          className="text-[12px] text-[var(--s-text-muted)] bg-transparent border border-[var(--s-border)] rounded-md py-1 cursor-pointer hover:text-[var(--s-text)] transition-colors"
        >
          Use page image
        </button>
      )}
      {image && <BtnGroup options={FIT_OPTIONS} value={image.fit} onChange={(fit) => onChange({ ...image, fit: fit as VectorFillFit })} />}
    </div>
  );
};
