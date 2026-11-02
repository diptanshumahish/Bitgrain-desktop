import { findEffect } from "@bitgrain/engine/styles/postfx/effect-registry";
import { inspectorTitle } from "../toolbar/inspector/inspector-titles";

export const effectTitle = (effectKey: string | null): string => findEffect(effectKey)?.label ?? inspectorTitle("effect");
