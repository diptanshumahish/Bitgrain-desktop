import type { TextAnimation, TextAlign } from "../types";

export interface TextTemplate {
  id: string;
  label: string;
  description: string;
  text: string;
  font: string;
  size: number;
  weight: number;
  color: string;
  align: TextAlign;
  animation: TextAnimation;
  position: { x: number; y: number };
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface OverlayTextPart {
  text: string;
  font: string;
  size: number;
  weight: number;
  color: string;
  align: TextAlign;
  animation: TextAnimation;
  position: { x: number; y: number };
  offset: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface OverlayTemplate {
  id: string;
  label: string;
  description: string;
  totalDuration: number;
  parts: OverlayTextPart[];
}

export interface ProjectTemplateSlot {
  kind: "image" | "video";
  trackStart: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
  label: string;
}

export interface ProjectTemplate {
  id: string;
  label: string;
  description: string;
  slots: ProjectTemplateSlot[];
  titles: OverlayTextPart[];
  duration: number;
}

export type TransitionKind = "crossfade" | "dip-black" | "dip-white" | "soft";

export interface TransitionPreset {
  id: TransitionKind;
  label: string;
  description: string;
  duration: number;
}
