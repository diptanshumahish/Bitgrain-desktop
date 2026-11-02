import React from "react";
import { X } from "lucide-react";
import { ImageSourceTabs } from "../panels/popovers/ImageSourceTabs";
import type { ImageDimensions } from "@bitgrain/darkroom/editor/upload/image-utils";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

interface AddImageModalProps {
  title?: string;
  onPick: (src: string, dims?: ImageDimensions, name?: string) => void;
  onClose: () => void;
}

export const AddImageModal: React.FC<AddImageModalProps> = ({ title = "Add image", onPick, onClose }) => (
  <div
    className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150`}
    onClick={(event) => event.target === event.currentTarget && onClose()}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add image"
      className="relative w-full max-w-[400px] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 font-editorial"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <h2 className="text-[14px] font-semibold text-[var(--s-text)]">{title}</h2>
        <button
          onClick={onClose}
          className="text-[var(--s-text-subtle)] hover:text-[var(--s-text)] transition-colors"
        >
          <X size={15} />
        </button>
      </div>
      <ImageSourceTabs
        onPick={(src, dims, name) => {
          onPick(src, dims, name);
          onClose();
        }}
      />
    </div>
  </div>
);
