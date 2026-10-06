export interface OverlayEffectContext {
  width: number;
  height: number;
  time: number;
  intensity: number;
  speed: number;
}

export type OverlayEffectFn = (
  image: ImageData,
  context: OverlayEffectContext,
) => void;
