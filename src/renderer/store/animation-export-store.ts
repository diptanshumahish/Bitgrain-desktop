import { signal, useSignalValue } from "../lib/signal";
import type { AnimationFormat, AnimationQuality } from "../engine/animate/export-page-animation";

const exporting = signal(false);
const progress = signal(0);
const error = signal<string | null>(null);
const exportScale = signal(2);
const exportQuality = signal<AnimationQuality>("high");
const exportFormat = signal<AnimationFormat>("mp4");

export function useExportFormat(): AnimationFormat {
  return useSignalValue(exportFormat);
}

export function setExportFormat(value: AnimationFormat): void {
  exportFormat.value = value;
}

export function useExportScale(): number {
  return useSignalValue(exportScale);
}

export function useExportQuality(): AnimationQuality {
  return useSignalValue(exportQuality);
}

export function setExportScale(value: number): void {
  exportScale.value = value;
}

export function setExportQuality(value: AnimationQuality): void {
  exportQuality.value = value;
}

export function getExportScale(): number {
  return exportScale.value;
}

export function getExportQuality(): AnimationQuality {
  return exportQuality.value;
}

export function useAnimationExporting(): boolean {
  return useSignalValue(exporting);
}

export function useAnimationExportProgress(): number {
  return useSignalValue(progress);
}

export function useAnimationExportError(): string | null {
  return useSignalValue(error);
}

export function setAnimationExporting(value: boolean): void {
  exporting.value = value;
}

export function setAnimationExportProgress(value: number): void {
  progress.value = value;
}

export function setAnimationExportError(value: string | null): void {
  error.value = value;
}
