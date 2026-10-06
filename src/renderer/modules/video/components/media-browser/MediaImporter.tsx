import React, { useRef, useState } from "react";
import { Plus, UploadCloud } from "lucide-react";
import { updateProject } from "../../store/project-store";
import { importMediaFiles } from "../../utils/import-media";
import { trackEvent } from "../../../../lib/tracker";

interface MediaImporterProps {
  iconOnly?: boolean;
}

export const MediaImporter: React.FC<MediaImporterProps> = ({ iconOnly }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      trackEvent("video_editor", "import_media_click", { details: { count: files.length } });
      const assets = await importMediaFiles(files);
      if (assets.length === 0) return;
      updateProject((p) => ({
        ...p,
        mediaPool: [...p.mediaPool, ...assets],
      }));
      trackEvent("video_editor", "media_imported", { details: { count: assets.length } });
    } finally {
      setBusy(false);
    }
  };

  const handleClick = () => inputRef.current?.click();

  if (iconOnly) {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={busy}
          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] disabled:opacity-50"
          aria-label="Add media"
        >
          <Plus size={12} />
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,audio/*,image/*"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </>
    );
  }

  return (
    <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
      <button
        onClick={handleClick}
        disabled={busy}
        className="w-12 h-12 rounded-xl border border-dashed border-[var(--s-border)] flex items-center justify-center mb-3 hover:border-[var(--s-text-muted)] transition-colors disabled:opacity-50"
        aria-label="Add media"
      >
        <UploadCloud size={16} className="text-[var(--s-text-subtle)]" />
      </button>
      <p className="text-[11px] text-[var(--s-text-muted)] mb-1">
        {busy ? "Importing…" : "No media yet"}
      </p>
      <p className="text-[10px] text-[var(--s-text-subtle)] leading-relaxed">
        Drop video, audio or images here, or click to choose files.
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};
