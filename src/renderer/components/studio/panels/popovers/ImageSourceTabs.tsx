import React, { useEffect, useRef, useState } from "react";
import { Upload, Link as LinkIcon, Library, Loader2, AlertCircle } from "lucide-react";
import {
  processImageFile,
  probeImageDimensions,
  type ImageDimensions,
} from "../../../../utils/image-utils";
import {
  uploadTemplateAsset,
  listTemplateAssets,
  hasAssetLibrary,
  type TemplateAsset,
} from "../../../../lib/template-assets";
import { resolveAssetUrl } from "../../../../lib/api-client";

type SourceTab = "upload" | "url" | "library";

interface ImageSourceTabsProps {
  onPick: (src: string, dims?: ImageDimensions) => void;
}

interface TabButtonProps {
  id: SourceTab;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onSelect: (id: SourceTab) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className={`flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[11px] font-semibold transition-colors ${
      active
        ? "bg-[var(--s-bg-input)] text-[var(--s-text)]"
        : "bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
    }`}
  >
    {icon}
    {label}
  </button>
);

export const ImageSourceTabs: React.FC<ImageSourceTabsProps> = ({ onPick }) => {
  const libraryAvailable = hasAssetLibrary();
  const [tab, setTab] = useState<SourceTab>("upload");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlBusy, setUrlBusy] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [assets, setAssets] = useState<TemplateAsset[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const libraryLoadedRef = useRef(false);

  useEffect(() => {
    if (tab !== "library" || libraryLoadedRef.current) return;
    libraryLoadedRef.current = true;
    setLibraryLoading(true);
    listTemplateAssets()
      .then(setAssets)
      .finally(() => setLibraryLoading(false));
  }, [tab]);

  const acceptFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadBusy(true);
    try {
      const dataUrl = await processImageFile(file);
      const assetUrl = await uploadTemplateAsset(dataUrl, file.name);
      const src = assetUrl ?? dataUrl;
      const dims = await probeImageDimensions(src);
      onPick(src, dims ?? undefined);
    } catch (err) {
      console.error("Failed to process image:", err);
    } finally {
      setUploadBusy(false);
    }
  };

  const submitUrl = async () => {
    const src = urlValue.trim();
    if (!src) return;
    setUrlBusy(true);
    setUrlError(null);
    const dims = await probeImageDimensions(src);
    setUrlBusy(false);
    if (!dims) {
      setUrlError("Could not load an image from that link.");
      return;
    }
    onPick(src, dims);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 px-2 pt-2">
        <TabButton id="upload" label="Upload" icon={<Upload size={12} />} active={tab === "upload"} onSelect={setTab} />
        <TabButton id="url" label="Paste link" icon={<LinkIcon size={12} />} active={tab === "url"} onSelect={setTab} />
        {libraryAvailable && (
          <TabButton id="library" label="Library" icon={<Library size={12} />} active={tab === "library"} onSelect={setTab} />
        )}
      </div>

      {tab === "upload" && (
        <div className="p-3">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              void acceptFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center justify-center gap-2 h-36 rounded-xl border border-dashed cursor-pointer transition-colors ${
              dragOver
                ? "border-[var(--s-accent)] bg-[var(--s-bg-input)]"
                : "border-[var(--s-border)] hover:border-[var(--s-accent)] hover:bg-[var(--s-bg-input)]"
            }`}
          >
            {uploadBusy ? (
              <Loader2 size={20} className="animate-spin text-[var(--s-text-subtle)]" />
            ) : (
              <Upload size={22} strokeWidth={1.5} className="text-[var(--s-text-subtle)]" />
            )}
            <span className="text-[11px] font-semibold text-[var(--s-text)]">
              {uploadBusy ? "Adding..." : "Drop an image or click to upload"}
            </span>
            <span className="text-[10px] text-[var(--s-text-subtle)]">png, jpg, webp, gif, heic</span>
            <input
              type="file"
              accept="image/*,image/heic,image/heif,.heic,.heif"
              className="hidden"
              onChange={(event) => {
                void acceptFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      )}

      {tab === "url" && (
        <div className="p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <input
              value={urlValue}
              placeholder="https://example.com/image.jpg"
              autoFocus
              onChange={(event) => {
                setUrlValue(event.target.value);
                setUrlError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submitUrl();
              }}
              className="flex-1 h-9 px-3 rounded-lg bg-[var(--s-bg-input)] text-[12px] text-[var(--s-text)] border border-transparent outline-none focus:border-[var(--s-accent)] transition-colors"
            />
            <button
              type="button"
              onClick={() => void submitUrl()}
              disabled={!urlValue.trim() || urlBusy}
              className="h-9 px-3.5 rounded-lg text-[12px] font-medium bg-[var(--s-text)] text-[var(--s-bg-panel)] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {urlBusy ? <Loader2 size={13} className="animate-spin" /> : "Add"}
            </button>
          </div>
          {urlError ? (
            <span className="flex items-center gap-1.5 text-[10.5px] text-red-500">
              <AlertCircle size={12} /> {urlError}
            </span>
          ) : (
            <span className="text-[10.5px] text-[var(--s-text-subtle)] leading-relaxed">
              Paste a direct image link. Links stay live, so a few may not export if the host blocks it.
            </span>
          )}
        </div>
      )}

      {tab === "library" && (
        <div className="p-3">
          {libraryLoading ? (
            <div className="flex items-center justify-center h-36">
              <Loader2 size={18} className="animate-spin text-[var(--s-text-subtle)]" />
            </div>
          ) : assets.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-[11px] text-[var(--s-text-subtle)]">
              No uploaded images yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 max-h-60 overflow-y-auto no-scrollbar">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={async () => {
                    const dims = await probeImageDimensions(resolveAssetUrl(asset.url) ?? asset.url);
                    onPick(asset.url, dims ?? undefined);
                  }}
                  className="aspect-square rounded-lg overflow-hidden border border-[var(--s-border)] hover:border-[var(--s-accent)] transition-colors"
                >
                  <img
                    src={resolveAssetUrl(asset.url) ?? asset.url}
                    alt={asset.filename}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
