export const WARP_VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vImagePoint;

void main() {
  vImagePoint = vec2((aPosition.x + 1.0) * 0.5, (1.0 - aPosition.y) * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const WARP_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vImagePoint;
out vec4 outColor;

uniform sampler2D uBase;
uniform sampler2D uArtwork;
uniform mat3 uInverseHomography;
uniform vec2 uBaseTexel;
uniform vec2 uArtworkTexel;
uniform vec2 uArtworkSpan;
uniform float uSurfaceLuminance;
uniform float uShading;
uniform float uDisplacement;
uniform float uDisplacementRadius;
uniform float uOpacity;
uniform float uSoftness;
uniform float uGrain;
uniform float uFabricDetail;
uniform float uLightTint;
uniform float uInkSheen;
uniform sampler2D uSurface;
uniform float uHasSurface;
uniform sampler2D uLight;
uniform float uHasLight;
uniform float uLightMean;

const vec3 LUMA_WEIGHTS = vec3(0.2126, 0.7152, 0.0722);
const float DISPLACEMENT_SCALE = 0.03;
const float MAX_SHADE = 2.0;
const float GRAIN_FREQUENCY = 741.0;
const float DEPTH_EPSILON = 0.000001;
const float DETAIL_RADIUS_SCALE = 5.0;
const float FOLD_LOD = 2.5;
const float WHITE_FABRIC_LUMINANCE = 0.92;
const float SURFACE_CENTRE = 128.0;
const float SURFACE_RANGE = 256.0;
const float BYTE_MAX = 255.0;

float luminanceOf(vec3 color) {
  return dot(color, LUMA_WEIGHTS);
}

vec3 lightColorAt(vec2 point) {
  return uHasLight > 0.5 ? texture(uLight, point).rgb : texture(uBase, point).rgb;
}

float lightAt(vec2 point) {
  return luminanceOf(lightColorAt(point));
}

float blurredLuminance(vec2 point, vec2 stride) {
  float total = lightAt(point) * 2.0;
  total += lightAt(point + vec2(stride.x, 0.0));
  total += lightAt(point - vec2(stride.x, 0.0));
  total += lightAt(point + vec2(0.0, stride.y));
  total += lightAt(point - vec2(0.0, stride.y));
  return total / 6.0;
}

float foldLuminance(vec2 point, vec2 stride) {
  if (uHasLight > 0.5) return luminanceOf(textureLod(uLight, point, FOLD_LOD).rgb) / max(uLightMean, 0.001);
  return blurredLuminance(point, stride);
}

vec2 surfaceGradient(vec2 point, vec2 stride) {
  float left = foldLuminance(point - vec2(stride.x, 0.0), stride);
  float right = foldLuminance(point + vec2(stride.x, 0.0), stride);
  float above = foldLuminance(point - vec2(0.0, stride.y), stride);
  float below = foldLuminance(point + vec2(0.0, stride.y), stride);
  return vec2(right - left, below - above);
}

vec4 sampleArtwork(vec2 uv, vec2 uvDx, vec2 uvDy) {
  if (uSoftness <= 0.0) return textureGrad(uArtwork, uv, uvDx, uvDy);
  vec2 stride = uArtworkTexel * uSoftness;
  vec4 total = textureGrad(uArtwork, uv, uvDx, uvDy) * 4.0;
  total += textureGrad(uArtwork, uv + vec2(stride.x, 0.0), uvDx, uvDy) * 2.0;
  total += textureGrad(uArtwork, uv - vec2(stride.x, 0.0), uvDx, uvDy) * 2.0;
  total += textureGrad(uArtwork, uv + vec2(0.0, stride.y), uvDx, uvDy) * 2.0;
  total += textureGrad(uArtwork, uv - vec2(0.0, stride.y), uvDx, uvDy) * 2.0;
  total += textureGrad(uArtwork, uv + stride, uvDx, uvDy);
  total += textureGrad(uArtwork, uv - stride, uvDx, uvDy);
  total += textureGrad(uArtwork, uv + vec2(stride.x, -stride.y), uvDx, uvDy);
  total += textureGrad(uArtwork, uv + vec2(-stride.x, stride.y), uvDx, uvDy);
  return total / 16.0;
}

vec2 wrapOnSurface(vec2 quadUv) {
  if (uHasSurface < 0.5) return quadUv;
  vec2 cells = vec2(textureSize(uSurface, 0));
  vec2 lookup = (clamp(quadUv, 0.0, 1.0) * (cells - 1.0) + 0.5) / cells;
  vec2 offset = (texture(uSurface, lookup).rg * BYTE_MAX - SURFACE_CENTRE) / SURFACE_RANGE;
  return quadUv + offset;
}

float grainAt(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453) - 0.5;
}

void main() {
  vec3 baseColor = texture(uBase, vImagePoint).rgb;

  vec2 gradient = surfaceGradient(vImagePoint, uBaseTexel * uDisplacementRadius);
  vec2 displacedPoint = vImagePoint - gradient * uDisplacement * DISPLACEMENT_SCALE;

  vec3 projected = uInverseHomography * vec3(displacedPoint, 1.0);
  float safeDepth = abs(projected.z) < DEPTH_EPSILON ? DEPTH_EPSILON : projected.z;
  vec2 quadUv = wrapOnSurface(projected.xy / safeDepth);
  vec2 span = max(uArtworkSpan, vec2(0.0001));
  vec2 uv = (quadUv - (1.0 - span) * 0.5) / span;

  vec2 uvDx = dFdx(uv);
  vec2 uvDy = dFdy(uv);

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    outColor = vec4(baseColor, 1.0);
    return;
  }

  vec4 artwork = sampleArtwork(uv, uvDx, uvDy);
  vec3 litColor = lightColorAt(vImagePoint);
  float litLuminance = luminanceOf(litColor);
  float reference = uHasLight > 0.5 ? max(uLightMean, WHITE_FABRIC_LUMINANCE) : uSurfaceLuminance;
  float shade = litLuminance / max(reference, 0.001);
  shade = clamp(mix(1.0, shade, uShading), 0.0, MAX_SHADE);

  float surroundings = blurredLuminance(vImagePoint, uBaseTexel * uDisplacementRadius * DETAIL_RADIUS_SCALE);
  float fabricDetail = litLuminance - surroundings;
  vec3 lightColor = litColor / max(litLuminance, 0.001);
  vec3 tint = mix(vec3(1.0), lightColor, uLightTint);

  vec3 ink = artwork.rgb * shade * tint;
  ink += fabricDetail * uFabricDetail * artwork.a;
  ink += baseColor * uInkSheen * artwork.a;
  ink += grainAt(vImagePoint * GRAIN_FREQUENCY) * uGrain * artwork.a;

  float coverage = artwork.a * uOpacity;
  vec3 composited = baseColor * (1.0 - coverage) + clamp(ink, 0.0, 1.0) * uOpacity;
  outColor = vec4(composited, 1.0);
}
`;
