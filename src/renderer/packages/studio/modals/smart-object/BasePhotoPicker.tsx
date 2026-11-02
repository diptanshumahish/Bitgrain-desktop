import React, { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { fetchMockups, assetUrl, loadImage } from "@bitgrain/platform/mockups/mockups-api";
import { slotToCorners } from "@bitgrain/engine/mockup/slot-corners";
import { DEFAULT_CORNERS } from "@bitgrain/engine/mockup/mockup-types";
import type { BackendMockup } from "@bitgrain/platform/mockups/mockups-api";
import type { MockupQuad } from "@bitgrain/engine/mockup/mockup-types";
import { trackEvent } from "@bitgrain/platform/tracker";

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
      trackEvent("studio", "mockup_base_photo_chosen", { details: { source: "upload" } });
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
      trackEvent("studio", "mockup_base_photo_chosen", { details: { source: "catalog", mockup_id: mockup.id } });
    } catch {
      /* skip mockups whose base asset fails to load */
    }
  };

  const tileClass = dark
    ? "border-white/10 hover:border-white/30 hover:bg-white/5"
    : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50";
  const headerClass = dark ? "text-zinc-400" : "text-zinc-500";

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center justify-center gap-2 h-28 rounded-xl border border-dashed text-[12px] transition-colors ${dark ? "border-white/15 text-zinc-400 hover:border-white/35 hover:bg-white/5" : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50"}`}
      >
        <Upload size={15} strokeWidth={2} />
        upload a photo to place your artwork on
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={chooseFile} />

      {catalog.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={`text-[11px] ${headerClass}`}>or pick a photo from the catalog</span>
          <div className="grid grid-cols-4 gap-2">
            {catalog.map((mockup) => (
              <button
                key={mockup.id}
                onClick={() => chooseCatalogItem(mockup)}
                title={mockup.name}
                className={`group relative aspect-[4/3] overflow-hidden rounded-lg border transition-colors ${tileClass}`}
              >
                <img src={assetUrl(mockup.baseAssetId)} alt={mockup.name} className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-[10.5px] font-medium text-white bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity truncate">
                  {mockup.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
