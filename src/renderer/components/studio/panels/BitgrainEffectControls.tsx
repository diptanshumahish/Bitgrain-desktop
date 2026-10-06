import React from "react";
import type {
  BitgrainEffect,
  BitgrainEffectKind,
} from "../../../data/studioTypes";
import {
  BITGRAIN_EFFECTS,
  BITGRAIN_GROUPS,
  BITGRAIN_GROUP_ORDER,
  defaultParamsFor,
  findEffectSpec,
} from "../../../utils/bitgrain-effect";
import { ScrubField, Toggle } from "../ui/panelPrimitives";
import { Dropdown } from "../ui/dropdown";
import { Diamond } from "lucide-react";
import {
  useAnimationMode,
  useActiveFrameIsOverride,
} from "../../../store/animation-editor-store";

interface BitgrainEffectControlsProps {
  effect: BitgrainEffect | undefined;
  onChange: (effect: BitgrainEffect | undefined) => void;
}

const NONE_VALUE = "__none__";

const GROUPED_EFFECT_OPTIONS = [...BITGRAIN_EFFECTS]
  .sort(
    (a, b) =>
      BITGRAIN_GROUP_ORDER.indexOf(BITGRAIN_GROUPS[a.kind] as (typeof BITGRAIN_GROUP_ORDER)[number]) -
      BITGRAIN_GROUP_ORDER.indexOf(BITGRAIN_GROUPS[b.kind] as (typeof BITGRAIN_GROUP_ORDER)[number]),
  )
  .map((entry) => ({
    value: entry.kind,
    label: entry.label,
    group: BITGRAIN_GROUPS[entry.kind],
  }));

export const BitgrainEffectControls: React.FC<BitgrainEffectControlsProps> = ({
  effect,
  onChange,
}) => {
  const handleKindChange = (value: string) => {
    if (value === NONE_VALUE) {
      onChange(undefined);
      return;
    }
    const next = value as BitgrainEffectKind;
    onChange({ kind: next, params: defaultParamsFor(next) });
  };

  const updateParam = (key: string, value: number | string | boolean) => {
    if (!effect) return;
    onChange({
      kind: effect.kind,
      params: { ...effect.params, [key]: value },
    });
  };

  const spec = effect ? findEffectSpec(effect.kind) : undefined;
  const animationMode = useAnimationMode();
  const isOverrideFrame = useActiveFrameIsOverride();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">
          Bitgrain effects
        </span>
        <Dropdown
          value={effect?.kind ?? NONE_VALUE}
          onChange={handleKindChange}
          options={[
            { value: NONE_VALUE, label: "None" },
            ...GROUPED_EFFECT_OPTIONS,
          ]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">
          Creative effects
        </span>
        {animationMode && effect && (
          <div
            className={`flex items-start gap-1.5 rounded-md px-2 py-1.5 text-[10.5px] leading-snug ${
              isOverrideFrame
                ? "bg-[var(--s-accent-soft)] text-[var(--s-accent)]"
                : "bg-[var(--s-bg-input)] text-[var(--s-text-subtle)]"
            }`}
          >
            <Diamond size={11} strokeWidth={1.75} className="mt-px shrink-0" />
            <span>
              {isOverrideFrame
                ? "Editing these values keyframes this frame, the effect animates from the previous frame."
                : "Base frame, edits apply to every frame. Select a later frame to keyframe the effect."}
            </span>
          </div>
        )}

        {spec && effect && spec.params.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {spec.params.map((param) => {
            if (param.type === "number") {
              const raw = effect.params[param.key];
              const value = typeof raw === "number" ? raw : param.default;
              return (
                <ScrubField
                  key={param.key}
                  label={param.label}
                  value={value}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  onChange={(v) => updateParam(param.key, v)}
                />
              );
            }
            if (param.type === "select") {
              const raw = effect.params[param.key];
              const value = typeof raw === "string" ? raw : param.default;
              return (
                <div key={param.key} className="flex flex-col gap-1">
                  <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">
                    {param.label}
                  </span>
                  <Dropdown
                    value={value}
                    onChange={(v) => updateParam(param.key, v)}
                    options={param.options}
                  />
                </div>
              );
            }
            const raw = effect.params[param.key];
            const value = typeof raw === "boolean" ? raw : param.default;
            return (
              <div
                key={param.key}
                className="flex items-center justify-between"
              >
                <span className="text-[11px] text-[var(--s-text-subtle)] font-medium">
                  {param.label}
                </span>
                <Toggle
                  value={value}
                  onChange={(v) => updateParam(param.key, v)}
                />
              </div>
            );
            })}
          </div>
        ) : (
          <span className="text-[10.5px] text-[var(--s-text-subtle)]">
            None applied
          </span>
        )}
      </div>
    </div>
  );
};
