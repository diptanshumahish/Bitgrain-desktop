import type { ParamValues } from "../engine/style-types";

type LookEffects = Record<string, ParamValues>;

export const tint = (colour: string, amount: number, blend: string): LookEffects => ({ tint: { colour, amount, blend } });
export const mono = (amount = 100): LookEffects => ({ mono: { amount } });
export const grain = (amount: number): LookEffects => ({ filmGrain: { amount } });
export const dust = (amount: number): LookEffects => ({ filmDust: { amount } });
export const scanlines = (amount: number): LookEffects => ({ scanlines: { amount } });
export const chromatic = (offset: number): LookEffects => ({ chromatic: { offset } });
export const vignette = (amount: number): LookEffects => ({ vignette: { amount } });
export const bloom = (amount: number): LookEffects => ({ bloom: { amount } });
export const crt = (amount: number): LookEffects => ({ crtCurve: { amount } });
export const halftone = (size: number): LookEffects => ({ halftone: { size } });
export const pixelate = (size: number): LookEffects => ({ pixelate: { size } });
export const glitch = (amount: number): LookEffects => ({ glitch: { amount } });

export const combine = (...parts: LookEffects[]): LookEffects => Object.assign({}, ...parts);
