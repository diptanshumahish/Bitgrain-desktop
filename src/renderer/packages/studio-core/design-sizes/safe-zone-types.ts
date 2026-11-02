export interface SafeZoneSpec {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageSafeZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  preset?: "margins";
}

export const makeSafeZoneId = (): string => `safe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const toFraction = (value: number, total: number): number => (total > 0 ? value / total : 0);

export function toPageSafeZones(specs: SafeZoneSpec[], pageWidth: number, pageHeight: number): PageSafeZone[] {
  return specs.map((spec) => ({
    id: makeSafeZoneId(),
    label: spec.label,
    x: toFraction(spec.x, pageWidth),
    y: toFraction(spec.y, pageHeight),
    width: toFraction(spec.width, pageWidth),
    height: toFraction(spec.height, pageHeight),
  }));
}
