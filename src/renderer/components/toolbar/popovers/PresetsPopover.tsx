import React, { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Popover } from "../Popover";
import { GOAL_PRESETS, PRESETS } from "../../../engine/presets";
import type { Preset, PresetConfig } from "../../../engine/presets";
import { PresetCard } from "./PresetCard";
import { SavePresetRow } from "./SavePresetRow";
import { trackEvent } from "../../../lib/tracker";

export type { PresetConfig, Preset };
export { GOAL_PRESETS, PRESETS };

const PREVIEW_IMAGE = "/sample.jpg";
const ALL_PRESETS = [...GOAL_PRESETS, ...PRESETS];

interface PresetsPopoverProps {
  onApplyPreset: (config: PresetConfig) => void;
  onClose: () => void;
  static?: boolean;
  currentConfig: PresetConfig;
  customPresets: Preset[];
  onSaveCustomPreset: (name: string, config: PresetConfig) => void;
  onDeleteCustomPreset: (name: string) => void;
}

export const PresetsPopover: React.FC<PresetsPopoverProps> = ({
  onApplyPreset,
  onClose,
  static: isStatic,
  currentConfig,
  customPresets,
  onSaveCustomPreset,
  onDeleteCustomPreset,
}) => {
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const handleSave = (name: string) => {
    if (!name) return;
    onSaveCustomPreset(name, currentConfig);
    setSaving(false);
    trackEvent("presets", "custom_preset_saved", { details: { name } });
  };

  const handleApply = (config: PresetConfig, name: string) => {
    onApplyPreset(config);
    onClose();
    trackEvent("presets", "preset_applied", { details: { name } });
  };

  const normalizedQuery = query.toLowerCase().trim();
  const filteredPresets = normalizedQuery
    ? ALL_PRESETS.filter((p) => p.name.toLowerCase().includes(normalizedQuery))
    : ALL_PRESETS;
  const filteredCustomPresets = normalizedQuery
    ? customPresets.filter((p) =>
        p.name.toLowerCase().includes(normalizedQuery),
      )
    : customPresets;

  const searchBar = (
    <div className="sticky top-0 z-10 bg-[var(--s-bg-panel)] px-3 pt-3 pb-2">
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--s-bg-input)] border border-[var(--s-border)] focus-within:border-[var(--s-accent)] transition-colors">
        <Search
          size={12}
          strokeWidth={2}
          className="text-[var(--s-text-subtle)] shrink-0"
        />
        <input
          type="text"
          placeholder="Search presets..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-[11px] bg-transparent outline-none text-[var(--s-text)] placeholder:text-[var(--s-text-subtle)]"
        />
      </div>
    </div>
  );

  const gridCols = isStatic ? "grid-cols-2" : "grid-cols-4";
  const colSpan = isStatic ? "col-span-2" : "col-span-4";

  const grid = (
    <div className={`grid ${gridCols} gap-2`}>
      {filteredPresets.length === 0 ? (
        <p className={`${colSpan} text-[11px] text-zinc-400 py-4 text-center`}>
          No presets match your search.
        </p>
      ) : (
        filteredPresets.map((p) => (
          <PresetCard
            key={p.name}
            preset={p}
            image={PREVIEW_IMAGE}
            onApply={() => handleApply(p.config, p.name)}
          />
        ))
      )}
    </div>
  );

  const myPresets = (
    <div className="p-3 pt-0">
      <p className="text-[10px] font-semibold text-[var(--s-text-subtle)] mb-1.5     ">
        My presets
      </p>
      {filteredCustomPresets.length === 0 && !saving && (
        <p className="text-[10px] text-[var(--s-text-subtle)] mb-1.5 italic">
          No saved presets yet.
        </p>
      )}
      {filteredCustomPresets.length > 0 && (
        <div className={`grid ${gridCols} gap-2 mb-2`}>
          {filteredCustomPresets.map((p) => (
            <div key={p.name} className="relative group">
              <PresetCard
                preset={p}
                image={PREVIEW_IMAGE}
                onApply={() => handleApply(p.config, p.name)}
              />
              <button
                onClick={() => onDeleteCustomPreset(p.name)}
                className="absolute top-1 right-1 w-4 h-4 rounded bg-[var(--s-bg-panel)]/80 text-[var(--s-text-subtle)] hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={9} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
      {saving ? (
        <SavePresetRow onSave={handleSave} onCancel={() => setSaving(false)} />
      ) : (
        <button
          onClick={() => setSaving(true)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-[var(--s-text-subtle)] hover:text-[var(--s-accent)] hover:bg-[var(--s-accent-soft)] transition-all"
        >
          <Plus size={11} strokeWidth={2.5} /> Save current as preset
        </button>
      )}
    </div>
  );

  return (
    <Popover
      onClose={onClose}
      className="w-[660px] left-1/2 -translate-x-1/2 max-w-[calc(100vw-32px)]"
      static={isStatic}
    >
      <div
        className={
          isStatic ? "" : "overflow-y-auto max-h-[min(540px,calc(100vh-120px))]"
        }
      >
        {searchBar}
        <div className="px-3 pb-3">{grid}</div>
        <div className="h-px bg-[var(--s-border)] opacity-50 mx-3" />
        {myPresets}
      </div>
    </Popover>
  );
};
