import React, { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { fetchMockups, assetUrl, loadImage } from "../mockups-api";
import { slotToCorners } from "../../../engine/mockup/slot-corners";
import { DEFAULT_CORNERS } from "../../../engine/mockup/mockup-types";
import type { BackendMockup } from "../mockups-api";
import type { MockupQuad } from "../../../engine/mockup/mockup-types";

interface BasePhotoPickerProps {
  dark: boolean;
  onSelect: (image: HTMLImageElement, corners: MockupQuad) => void;
}

export const BasePhotoPicker: React.FC<BasePhotoPickerProps> = ({ dark, onSelect }) => {
  const [catalog, setCatalog] = useState<BackendMockup[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMockups()
      .then((result) => {
        if (!cancelled && result?.items?.length) setCatalog(result.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const chooseFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(objectUrl);
      await image.decode();
      onSelect(image, DEFAULT_CORNERS);
    } catch {
      return;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const chooseCatalogItem = async (mockup: BackendMockup): Promise<void> => {
    try {
      const image = await loadImage(assetUrl(mockup.baseAssetId));
      const aspectRatio = image.naturalWidth / image.naturalHeight;
      const corners = mockup.slot.corners ?? slotToCorners(mockup.slot, aspectRatio);
      onSelect(image, corners);
    } catch {
      /* skip mockups whose base asset fails to load */
    }
  };

  const tileClass = dark ? "border-white/10 hover:border-white/25" : "border-zinc-200 hover:border-zinc-400";

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center justify-center gap-2 h-24 rounded-lg border border-dashed text-[12px] ${dark ? "border-white/15 text-zinc-400 hover:border-white/30" : "border-zinc-300 text-zinc-500 hover:border-zinc-400"}`}
      >
        <Upload size={15} strokeWidth={2} />
        upload a photo to place your artwork on
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={chooseFile} />

      {catalog.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {catalog.map((mockup) => (
            <button
              key={mockup.id}
              onClick={() => chooseCatalogItem(mockup)}
              title={mockup.name}
              className={`aspect-[4/3] overflow-hidden rounded-lg border ${tileClass}`}
            >
              <img src={assetUrl(mockup.baseAssetId)} alt={mockup.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
