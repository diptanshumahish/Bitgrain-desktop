import type { StyleDefinition } from "../../engine/style-definition";
import type { StyleLook } from "../../engine/style-types";
import { INK_LOOKS, INK_STYLES } from "./ink/ink-index";
import { SCREEN_LOOKS, SCREEN_STYLES } from "./screen/screen-index";

export const PRINT_STYLES: readonly StyleDefinition[] = [...SCREEN_STYLES, ...INK_STYLES];

export const PRINT_LOOKS: Readonly<Record<string, readonly StyleLook[]>> = { ...SCREEN_LOOKS, ...INK_LOOKS };
