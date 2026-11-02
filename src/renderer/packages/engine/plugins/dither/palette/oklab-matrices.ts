const OKLAB_M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];
export const OKLAB_M2 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

export const L_FROM_R = OKLAB_M1[0][0];
export const L_FROM_G = OKLAB_M1[0][1];
export const L_FROM_B = OKLAB_M1[0][2];
export const M_FROM_R = OKLAB_M1[1][0];
export const M_FROM_G = OKLAB_M1[1][1];
export const M_FROM_B = OKLAB_M1[1][2];
export const S_FROM_R = OKLAB_M1[2][0];
export const S_FROM_G = OKLAB_M1[2][1];
export const S_FROM_B = OKLAB_M1[2][2];
export const LIGHT_FROM_L = OKLAB_M2[0][0];
export const LIGHT_FROM_M = OKLAB_M2[0][1];
export const LIGHT_FROM_S = OKLAB_M2[0][2];
export const A_FROM_L = OKLAB_M2[1][0];
export const A_FROM_M = OKLAB_M2[1][1];
export const A_FROM_S = OKLAB_M2[1][2];
export const B_FROM_L = OKLAB_M2[2][0];
export const B_FROM_M = OKLAB_M2[2][1];
export const B_FROM_S = OKLAB_M2[2][2];

export const linearToOklab = (red: number, green: number, blue: number, out: Float32Array, offset: number): void => {
  const long = Math.cbrt(Math.max(0, L_FROM_R * red + L_FROM_G * green + L_FROM_B * blue));
  const medium = Math.cbrt(Math.max(0, M_FROM_R * red + M_FROM_G * green + M_FROM_B * blue));
  const short = Math.cbrt(Math.max(0, S_FROM_R * red + S_FROM_G * green + S_FROM_B * blue));
  out[offset] = LIGHT_FROM_L * long + LIGHT_FROM_M * medium + LIGHT_FROM_S * short;
  out[offset + 1] = A_FROM_L * long + A_FROM_M * medium + A_FROM_S * short;
  out[offset + 2] = B_FROM_L * long + B_FROM_M * medium + B_FROM_S * short;
};
