import type { TextEffect } from "../../model/studio-types";

const scaleEffect = (effect: TextEffect, factor: number): TextEffect => {
  if (effect.type === "shadow") {
    return { ...effect, x: effect.x * factor, y: effect.y * factor, blur: effect.blur * factor };
  }
  if (effect.type === "outline") return { ...effect, width: effect.width * factor };
  if (effect.type === "lift") return { ...effect, distance: effect.distance * factor };
  if (effect.type === "glow") return { ...effect, blur: effect.blur * factor };
  return { ...effect, offsetX: effect.offsetX * factor, offsetY: effect.offsetY * factor };
};

export const scaleTextEffects = (effects: TextEffect[] | undefined, factor: number): TextEffect[] | undefined =>
  effects?.map((effect) => scaleEffect(effect, factor));
