export interface ImageProfile {
  meanLuma: number;
  lumaSpread: number;
  meanSaturation: number;
  detail: number;
}

export const NEUTRAL_PROFILE: ImageProfile = {
  meanLuma: 0.5,
  lumaSpread: 0.22,
  meanSaturation: 0.3,
  detail: 0.5,
};

export const MUTED_SATURATION = 0.12;
export const VIVID_SATURATION = 0.45;
export const HIGH_DETAIL = 0.6;
export const LOW_DETAIL = 0.3;
export const DARK_LUMA = 0.35;
export const BRIGHT_LUMA = 0.65;
