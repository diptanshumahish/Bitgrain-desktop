import { memo, type ComponentType, type MemoExoticComponent } from "react";
import { signal } from "@bitgrain/core/signal";

export const canvasGestureSignal = signal<boolean>(false);

const isGestureRunning = (): boolean => canvasGestureSignal.value;

export const freezeDuringGesture = <Props extends object>(
  Component: ComponentType<Props>,
): MemoExoticComponent<ComponentType<Props>> => memo(Component, isGestureRunning);
