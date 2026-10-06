import React, { useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import type { TextLayer, TextEffect } from "../../../../data/studioTypes";
import { ColorPicker } from "../../ui/ColorPicker";
import { ScrubField } from "../../ui/panelPrimitives";
import { PanelGroup } from "../../ui/panel-group";

type EffectType = TextEffect["type"];

const EFFECT_PRESETS: Array<{ type: EffectType; label: string }> = [
  { type: "shadow", label: "Shadow" },
  { type: "outline", label: "Outline" },
  { type: "lift", label: "Lift" },
  { type: "glitch", label: "Glitch" },
];

const defaultEffect = (type: EffectType): TextEffect => {
  if (type === "shadow") return { type, x: 3, y: 3, blur: 6, color: "#000000" };
  if (type === "outline") return { type, width: 2, color: "#000000" };
  if (type === "lift") return { type, distance: 7, opacity: 0.35 };
  return {
    type: "glitch",
    offsetX: 2,
    offsetY: 1,
    color1: "#ff0080",
    color2: "#00ffff",
  };
};

interface EffectRowProps {
  effect: TextEffect;
  onUpdate: (e: TextEffect) => void;
  onRemove: () => void;
}

const EffectRow: React.FC<EffectRowProps> = ({
  effect,
  onUpdate,
  onRemove,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--s-border)] bg-[var(--s-bg-panel)]">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 h-9">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-left p-0"
        >
          <span className="text-[11px] font-semibold text-[var(--s-text)] font-editorial capitalize  ">
            {effect.type}
          </span>
          <ChevronDown
            size={10}
            strokeWidth={1.5}
            className={`text-[var(--s-text-subtle)] transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={onRemove}
          className="w-5 h-5 rounded-md border-none bg-transparent cursor-pointer flex items-center justify-center text-[var(--s-text-subtle)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Minus size={10} strokeWidth={1.5} />
        </button>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-[var(--s-border)] bg-[var(--s-bg-input)]/60 px-3 py-2.5 flex flex-col gap-2">
          {effect.type === "shadow" && (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                <ScrubField
                  label="X"
                  value={effect.x}
                  min={-60}
                  max={60}
                  step={1}
                  onChange={(v) => onUpdate({ ...effect, x: v })}
                />
                <ScrubField
                  label="Y"
                  value={effect.y}
                  min={-60}
                  max={60}
                  step={1}
                  onChange={(v) => onUpdate({ ...effect, y: v })}
                />
                <ScrubField
                  label="Blur"
                  value={effect.blur}
                  min={0}
                  max={80}
                  step={1}
                  onChange={(v) => onUpdate({ ...effect, blur: v })}
                />
              </div>
              <ColorPicker
                color={effect.color}
                onChange={(c) => onUpdate({ ...effect, color: c })}
              />
            </>
          )}
          {effect.type === "outline" && (
            <>
              <ScrubField
                label="Width"
                value={effect.width}
                min={1}
                max={20}
                step={1}
                onChange={(v) => onUpdate({ ...effect, width: v })}
              />
              <ColorPicker
                color={effect.color}
                onChange={(v) => onUpdate({ ...effect, color: v })}
              />
            </>
          )}
          {effect.type === "lift" && (
            <div className="grid grid-cols-2 gap-1.5">
              <ScrubField
                label="Dist"
                value={effect.distance}
                min={1}
                max={40}
                step={1}
                onChange={(v) => onUpdate({ ...effect, distance: v })}
              />
              <ScrubField
                label="Opacity"
                value={Math.round(effect.opacity * 100)}
                min={0}
                max={100}
                step={1}
                onChange={(v) => onUpdate({ ...effect, opacity: v / 100 })}
              />
            </div>
          )}
          {effect.type === "glitch" && (
            <>
              <div className="grid grid-cols-2 gap-1.5">
                <ScrubField
                  label="X"
                  value={effect.offsetX}
                  min={0}
                  max={20}
                  step={0.5}
                  onChange={(v) => onUpdate({ ...effect, offsetX: v })}
                />
                <ScrubField
                  label="Y"
                  value={effect.offsetY}
                  min={0}
                  max={20}
                  step={0.5}
                  onChange={(v) => onUpdate({ ...effect, offsetY: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <ColorPicker
                  color={effect.color1}
                  label="Color 1"
                  onChange={(c) => onUpdate({ ...effect, color1: c })}
                />
                <ColorPicker
                  color={effect.color2}
                  label="Color 2"
                  onChange={(c) => onUpdate({ ...effect, color2: c })}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface EffectsSectionProps {
  layer: TextLayer;
  onChange: (u: Partial<TextLayer>) => void;
}

export const EffectsSection: React.FC<EffectsSectionProps> = ({
  layer,
  onChange,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const effects = layer.effects ?? [];

  const update = (i: number, e: TextEffect) => {
    const next = [...effects];
    next[i] = e;
    onChange({ effects: next });
  };

  const remove = (i: number) =>
    onChange({ effects: effects.filter((_, idx) => idx !== i) });

  const add = (type: EffectType) => {
    onChange({ effects: [...effects, defaultEffect(type)] });
    setAddOpen(false);
  };

  return (
    <PanelGroup title="Effects">
      <div className="flex items-center gap-1.5">
        <small className="text-[10px] text-(--s-text-subtle) mr-auto">
          Stack shadow, outline, lift, glitch
        </small>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddOpen((v) => !v);
            }}
            className={`w-6 h-6 rounded-md border-none cursor-pointer flex items-center justify-center transition-all duration-100 ${
              addOpen
                ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-subtle)]"
            }`}
          >
            <Plus size={13} />
          </button>
          {addOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-lg z-100 min-w-[110px] overflow-hidden">
              {EFFECT_PRESETS.map((p) => (
                <button
                  key={p.type}
                  onClick={() => add(p.type)}
                  className="block w-full px-3 py-[7px] text-left bg-transparent border-none cursor-pointer text-[11px] text-[var(--s-text)] font-editorial font-medium hover:bg-[var(--s-bg-input)]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {effects.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {effects.map((e, i) => (
            <EffectRow
              key={i}
              effect={e}
              onUpdate={(eff) => update(i, eff)}
              onRemove={() => remove(i)}
            />
          ))}
        </div>
      )}
    </PanelGroup>
  );
};
