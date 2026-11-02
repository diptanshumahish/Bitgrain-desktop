import React, { useRef } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import type { KitLogo, KitLogoRole } from "@bitgrain/studio-core/model/design-kit-types";
import { logoRoleInfo, removeKitLogo, uploadingLogoRoleSignal } from "./kit-logo-store";
import { uploadKitLogo } from "./upload-kit-logo";
import { insertKitLogo } from "./insert-kit-logo";

const LOGO_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

interface KitLogoSlotProps {
  kitId: string;
  role: KitLogoRole;
  logo: KitLogo | undefined;
}

const previewSurface = (role: KitLogoRole): string =>
  role === "onDark" ? "bg-neutral-900" : "bg-[var(--s-bg-input)]";

export const KitLogoSlot: React.FC<KitLogoSlotProps> = ({ kitId, role, logo }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRole = useSignalValue(uploadingLogoRoleSignal);
  const info = logoRoleInfo(role);
  const uploading = uploadingRole === role;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadKitLogo(kitId, role, file);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        title={logo ? "Add to design" : `Upload ${info.label.toLowerCase()} logo`}
        disabled={uploading}
        onClick={() => (logo ? insertKitLogo(logo) : inputRef.current?.click())}
        className={`w-12 h-9 rounded-md border border-[var(--s-border)] shrink-0 flex items-center justify-center overflow-hidden ${previewSurface(role)}`}
      >
        {uploading && <Loader2 size={12} className="animate-spin text-[var(--s-text-subtle)]" />}
        {!uploading && logo && <img src={resolveAssetUrl(logo.src) ?? ""} alt="" className="max-w-full max-h-full object-contain p-1" />}
        {!uploading && !logo && <Plus size={12} strokeWidth={2} className="text-[var(--s-text-subtle)]" />}
      </button>
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-[12px] text-[var(--s-text)]">{info.label}</span>
        <span className="text-[11px] text-[var(--s-text-subtle)] truncate">{info.hint}</span>
      </div>
      {logo && (
        <button
          type="button"
          onClick={() => removeKitLogo(kitId, role)}
          title="Remove logo"
          className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--s-text-subtle)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <Trash2 size={11} strokeWidth={1.75} />
        </button>
      )}
      <input ref={inputRef} type="file" accept={LOGO_ACCEPT} className="hidden" onChange={handleFile} />
    </div>
  );
};
