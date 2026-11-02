const SQRT_THREE = Math.sqrt(3);
const ONE_THIRD = 1 / 3;
const TWO_THIRDS = 2 / 3;
const ROW_STEP = 1.5;
const POINTY_NORMALS = [0, Math.PI / 3, (2 * Math.PI) / 3] as const;
const FLAT_NORMALS = [Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6] as const;

export interface HexLayout {
  size: number;
  pointy: boolean;
  inradius: number;
  normals: Float64Array;
}

export interface HexHit {
  centreX: number;
  centreY: number;
  offsetX: number;
  offsetY: number;
}

export const buildHexLayout = (size: number, pointy: boolean): HexLayout => {
  const angles = pointy ? POINTY_NORMALS : FLAT_NORMALS;
  const normals = new Float64Array(angles.length * 2);
  angles.forEach((angle, index) => {
    normals[index * 2] = Math.cos(angle);
    normals[index * 2 + 1] = Math.sin(angle);
  });
  return { size, pointy, inradius: (size * SQRT_THREE) / 2, normals };
};

const roundAxial = (axialQ: number, axialR: number, hit: HexHit, layout: HexLayout): void => {
  const axialS = -axialQ - axialR;
  let roundQ = Math.round(axialQ);
  let roundR = Math.round(axialR);
  const roundS = Math.round(axialS);
  const errorQ = Math.abs(roundQ - axialQ);
  const errorR = Math.abs(roundR - axialR);
  const errorS = Math.abs(roundS - axialS);
  if (errorQ > errorR && errorQ > errorS) roundQ = -roundR - roundS;
  else if (errorR > errorS) roundR = -roundQ - roundS;
  const size = layout.size;
  hit.centreX = layout.pointy ? size * (SQRT_THREE * roundQ + (SQRT_THREE / 2) * roundR) : ROW_STEP * roundQ * size;
  hit.centreY = layout.pointy ? ROW_STEP * roundR * size : size * ((SQRT_THREE / 2) * roundQ + SQRT_THREE * roundR);
};

export const locateHex = (layout: HexLayout, x: number, y: number, hit: HexHit): void => {
  const size = layout.size;
  if (layout.pointy) roundAxial(((SQRT_THREE / 3) * x - ONE_THIRD * y) / size, (TWO_THIRDS * y) / size, hit, layout);
  else roundAxial((TWO_THIRDS * x) / size, (-ONE_THIRD * x + (SQRT_THREE / 3) * y) / size, hit, layout);
  hit.offsetX = x - hit.centreX;
  hit.offsetY = y - hit.centreY;
};

export const edgeDistance = (layout: HexLayout, hit: HexHit): number => {
  const { normals } = layout;
  let reach = 0;
  for (let index = 0; index < normals.length; index += 2) {
    reach = Math.max(reach, Math.abs(normals[index] * hit.offsetX + normals[index + 1] * hit.offsetY));
  }
  return layout.inradius - reach;
};
