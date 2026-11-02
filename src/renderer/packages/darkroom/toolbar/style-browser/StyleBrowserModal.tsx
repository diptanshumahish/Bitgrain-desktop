import React, { useEffect } from "react";
import { Search, X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { requestStyleThumbs } from "../../styles/thumbs/style-thumbs";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";
import { ALL_FAMILIES, styleFamilySignal, styleSearchSignal } from "./style-browser-store";
import { visibleFamilies, type BrowserEntry } from "./browser-entries";
import { BrowserSections } from "./BrowserSections";
import { FamilyNav } from "./FamilyNav";
import { useBrowserBinding } from "./use-browser-binding";
import type { StyleBrowserTarget } from "./style-browser-target";

interface StyleBrowserModalProps {
  target?: StyleBrowserTarget;
  onClose: () => void;
}

const useEscape = (onClose: () => void): void => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);
};

export const StyleBrowserModal: React.FC<StyleBrowserModalProps> = ({ target, onClose }) => {
  const query = useSignalValue(styleSearchSignal);
  const family = useSignalValue(styleFamilySignal);
  const binding = useBrowserBinding(target);
  const { thumbSource, currentStyleId } = binding;

  useEffect(() => {
    if (thumbSource) void requestStyleThumbs(thumbSource, currentStyleId ? [currentStyleId] : []);
  }, [thumbSource, currentStyleId]);
  useEscape(onClose);

  const choose = (entry: BrowserEntry): void => {
    binding.pick(entry);
    onClose();
  };

  return (
    <div className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center bg-black/55 backdrop-blur-sm p-6 font-editorial`}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Choose a style"
        className="w-full max-w-[1040px] h-[min(760px,86vh)] flex flex-col overflow-hidden rounded-2xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] text-[var(--s-text)]">
        <header className="h-16 shrink-0 flex items-center gap-4 px-5 border-b border-[var(--s-border)]">
          <div className="flex flex-col">
            <h2 className="text-[15px] font-semibold leading-tight">Choose a style</h2>
            <p className="text-[12px] text-[var(--s-text-subtle)]">Every preview uses your image</p>
          </div>
          <label className="ml-auto flex items-center gap-2 h-9 w-72 px-3 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] focus-within:border-[var(--s-text-subtle)]">
            <Search size={14} className="text-[var(--s-text-subtle)]" />
            <input autoFocus value={query} onChange={(event) => { styleSearchSignal.value = event.target.value; }}
              placeholder="Search styles" aria-label="Search styles"
              className="flex-1 min-w-0 bg-transparent text-[13px] text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)] outline-none" />
          </label>
          <button type="button" onClick={onClose} aria-label="Close"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)]">
            <X size={16} />
          </button>
        </header>
        <div className="flex-1 min-h-0 flex">
          <FamilyNav families={binding.pool} active={family} allId={ALL_FAMILIES} onSelect={(next) => { styleFamilySignal.value = next; }} />
          <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5">
            <BrowserSections families={visibleFamilies(binding.pool, family, query, ALL_FAMILIES)} isSelected={binding.isSelected} onPick={choose} />
          </div>
        </div>
      </div>
    </div>
  );
};
