import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { registerDeviceFont } from "../../utils/device-fonts";

interface FontUploadButtonProps {
  onUploaded: (fontValue: string) => void;
}

export const FontUploadButton: React.FC<FontUploadButtonProps> = ({
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const value = await registerDeviceFont(file);
    if (value) onUploaded(value);
  };

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-[var(--s-border)] text-[10px] text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors"
      >
        <Upload size={11} />
        Upload font from device
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2,font/*"
        onChange={(event) => void handleFile(event)}
        className="hidden"
      />
    </>
  );
};
