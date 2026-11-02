import { convertedSourceSignal } from "./converted-source-store";
import { hasAppliedLook } from "./has-applied-look";

export const isPlainConversion = (): boolean => convertedSourceSignal.value !== null && !hasAppliedLook();
