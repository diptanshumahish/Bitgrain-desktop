import type { DrawContext, Frame } from "./frame";
import type { RandomSource } from "./seeded-random";
import type { ParamSpec, ParamValues, StyleCategory } from "./style-types";

export interface SourceImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface CellRenderInput {
  layer: DrawContext;
  source: SourceImage;
  params: ParamValues;
  scale: number;
  random: RandomSource;
}

export interface FrameRenderInput {
  frame: Frame;
  source: SourceImage;
  params: ParamValues;
  scale: number;
  random: RandomSource;
}

interface StyleDefinitionBase {
  id: string;
  label: string;
  hint: string;
  glyph: string;
  category: StyleCategory;
  params: readonly ParamSpec[];
}

export interface CellStyleDefinition extends StyleDefinitionBase {
  kind: "cells";
  finishDefaults?: ParamValues;
  drawCells: (input: CellRenderInput) => void;
}

export interface FrameStyleDefinition extends StyleDefinitionBase {
  kind: "frame";
  renderFrame: (input: FrameRenderInput) => void;
}

export type StyleDefinition = CellStyleDefinition | FrameStyleDefinition;
