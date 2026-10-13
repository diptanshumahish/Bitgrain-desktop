import type { ElementCard } from "./element-types";

const WIDE_ASPECT = 3;

export const isWideElement = (element: ElementCard): boolean => element.width / element.height >= WIDE_ASPECT;
