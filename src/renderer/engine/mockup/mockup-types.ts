export interface MockupPoint {
  x: number;
  y: number;
}

export type MockupQuad = [MockupPoint, MockupPoint, MockupPoint, MockupPoint];

export type Matrix3x3 = [number, number, number, number, number, number, number, number, number];

export interface SmartObjectSettings {
  shading: number;
  displacement: number;
  displacementRadius: number;
  opacity: number;
  softness: number;
  grain: number;
  preserveAspect: boolean;
}

export const DEFAULT_SMART_OBJECT_SETTINGS: SmartObjectSettings = {
  shading: 0.85,
  displacement: 0.15,
  displacementRadius: 3,
  opacity: 1,
  softness: 0,
  grain: 0.05,
  preserveAspect: false,
};

export const DEFAULT_CORNERS: MockupQuad = [
  { x: 0.3, y: 0.3 },
  { x: 0.7, y: 0.3 },
  { x: 0.7, y: 0.7 },
  { x: 0.3, y: 0.7 },
];
