export interface UniformLocations {
  base: WebGLUniformLocation | null;
  artwork: WebGLUniformLocation | null;
  inverseHomography: WebGLUniformLocation | null;
  baseTexel: WebGLUniformLocation | null;
  artworkTexel: WebGLUniformLocation | null;
  artworkSpan: WebGLUniformLocation | null;
  surfaceLuminance: WebGLUniformLocation | null;
  shading: WebGLUniformLocation | null;
  displacement: WebGLUniformLocation | null;
  displacementRadius: WebGLUniformLocation | null;
  opacity: WebGLUniformLocation | null;
  softness: WebGLUniformLocation | null;
  grain: WebGLUniformLocation | null;
  fabricDetail: WebGLUniformLocation | null;
  lightTint: WebGLUniformLocation | null;
  inkSheen: WebGLUniformLocation | null;
  surface: WebGLUniformLocation | null;
  hasSurface: WebGLUniformLocation | null;
  light: WebGLUniformLocation | null;
  hasLight: WebGLUniformLocation | null;
  lightMean: WebGLUniformLocation | null;
}

export const readUniformLocations = (gl: WebGL2RenderingContext, program: WebGLProgram): UniformLocations => {
  const at = (name: string): WebGLUniformLocation | null => gl.getUniformLocation(program, name);
  return {
    base: at("uBase"),
    artwork: at("uArtwork"),
    inverseHomography: at("uInverseHomography"),
    baseTexel: at("uBaseTexel"),
    artworkTexel: at("uArtworkTexel"),
    artworkSpan: at("uArtworkSpan"),
    surfaceLuminance: at("uSurfaceLuminance"),
    shading: at("uShading"),
    displacement: at("uDisplacement"),
    displacementRadius: at("uDisplacementRadius"),
    opacity: at("uOpacity"),
    softness: at("uSoftness"),
    grain: at("uGrain"),
    fabricDetail: at("uFabricDetail"),
    lightTint: at("uLightTint"),
    inkSheen: at("uInkSheen"),
    surface: at("uSurface"),
    hasSurface: at("uHasSurface"),
    light: at("uLight"),
    hasLight: at("uHasLight"),
    lightMean: at("uLightMean"),
  };
};
