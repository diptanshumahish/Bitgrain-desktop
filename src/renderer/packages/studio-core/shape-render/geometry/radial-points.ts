const TOP_ANGLE = -Math.PI / 2;

export interface EllipseFrame {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export const starPoints = (frame: EllipseFrame, innerRatio: number, points: number): string => {
  const coords: string[] = [];
  for (let index = 0; index < points * 2; index++) {
    const angle = (index * Math.PI) / points + TOP_ANGLE;
    const ratio = index % 2 === 0 ? 1 : innerRatio;
    coords.push(`${frame.cx + frame.rx * ratio * Math.cos(angle)},${frame.cy + frame.ry * ratio * Math.sin(angle)}`);
  }
  return coords.join(" ");
};

export const polygonPoints = (frame: EllipseFrame, sides: number): string => {
  const coords: string[] = [];
  for (let index = 0; index < sides; index++) {
    const angle = (index * 2 * Math.PI) / sides + TOP_ANGLE;
    coords.push(`${frame.cx + frame.rx * Math.cos(angle)},${frame.cy + frame.ry * Math.sin(angle)}`);
  }
  return coords.join(" ");
};
