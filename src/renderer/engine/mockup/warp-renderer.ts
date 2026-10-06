import { WARP_FRAGMENT_SHADER, WARP_VERTEX_SHADER } from "./warp-shaders";
import { solveQuadToUnitSquare } from "./homography";
import { SurfaceSampler } from "./surface-luminance";
import { containArtworkSpan, quadAspectRatio, FULL_SPAN } from "./quad-metrics";
import type { ArtworkSpan } from "./quad-metrics";
import type { Matrix3x3, MockupQuad, SmartObjectSettings } from "./mockup-types";

const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);
const VERTEX_COMPONENTS = 2;
const VERTEX_COUNT = 3;

interface UniformLocations {
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
}

const toColumnMajor = (matrix: Matrix3x3): Float32Array => {
  const [a, b, c, d, e, f, g, h, i] = matrix;
  return new Float32Array([a, d, g, b, e, h, c, f, i]);
};

const compileShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader compile failed: ${log ?? "unknown"}`);
  }
  return shader;
};

const linkProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, WARP_VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, WARP_FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("could not create program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`program link failed: ${log ?? "unknown"}`);
  }
  return program;
};

const applyMaxAnisotropy = (gl: WebGL2RenderingContext): void => {
  const extension = gl.getExtension("EXT_texture_filter_anisotropic");
  if (!extension) return;
  const limit = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
  gl.texParameterf(gl.TEXTURE_2D, extension.TEXTURE_MAX_ANISOTROPY_EXT, limit);
};

const createTexture = (gl: WebGL2RenderingContext, withMipmaps: boolean): WebGLTexture => {
  const texture = gl.createTexture();
  if (!texture) throw new Error("could not create texture");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, withMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  if (withMipmaps) applyMaxAnisotropy(gl);
  return texture;
};

const sourceWidth = (source: TexImageSource): number =>
  (source as { width?: number }).width ?? (source as { videoWidth?: number }).videoWidth ?? 1;

const sourceHeight = (source: TexImageSource): number =>
  (source as { height?: number }).height ?? (source as { videoHeight?: number }).videoHeight ?? 1;

export const isSmartObjectSupported = (): boolean => {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
};

export class SmartObjectRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly uniforms: UniformLocations;
  private readonly baseTexture: WebGLTexture;
  private readonly artworkTexture: WebGLTexture;
  private baseSource: TexImageSource | null = null;
  private artworkSource: TexImageSource | null = null;
  private sampler: SurfaceSampler | null = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("webgl2", { premultipliedAlpha: false, antialias: false });
    if (!context) throw new Error("webgl2 is not available");
    this.gl = context;
    this.program = linkProgram(this.gl);
    this.uniforms = this.readUniformLocations();
    this.baseTexture = createTexture(this.gl, false);
    this.artworkTexture = createTexture(this.gl, true);
    this.setupGeometry();
  }

  private readUniformLocations(): UniformLocations {
    const { gl, program } = this;
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
    };
  }

  private setupGeometry(): void {
    const { gl, program } = this;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, VERTEX_COMPONENTS, gl.FLOAT, false, 0, 0);
  }

  private uploadTexture(texture: WebGLTexture, unit: number, source: TexImageSource, withMipmaps: boolean): void {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    if (withMipmaps) gl.generateMipmap(gl.TEXTURE_2D);
  }

  setBase(base: TexImageSource): void {
    if (this.baseSource === base) return;
    this.uploadTexture(this.baseTexture, 0, base, false);
    this.baseSource = base;
    this.sampler = new SurfaceSampler(base);
  }

  setArtwork(artwork: TexImageSource): void {
    if (this.artworkSource === artwork) return;
    this.uploadTexture(this.artworkTexture, 1, artwork, true);
    this.artworkSource = artwork;
  }

  private bindTextures(): void {
    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.baseTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.artworkTexture);
  }

  private resolveSpan(corners: MockupQuad, settings: SmartObjectSettings, width: number, height: number): ArtworkSpan {
    if (!settings.preserveAspect || !this.artworkSource) return FULL_SPAN;
    const artworkAspect = sourceWidth(this.artworkSource) / sourceHeight(this.artworkSource);
    return containArtworkSpan(quadAspectRatio(corners, width, height), artworkAspect);
  }

  private applyUniforms(
    corners: MockupQuad,
    settings: SmartObjectSettings,
    inverse: Matrix3x3,
    width: number,
    height: number,
  ): void {
    const { gl, uniforms, baseSource, artworkSource } = this;
    if (!baseSource || !artworkSource) return;
    const span = this.resolveSpan(corners, settings, width, height);
    gl.uniform1i(uniforms.base, 0);
    gl.uniform1i(uniforms.artwork, 1);
    gl.uniformMatrix3fv(uniforms.inverseHomography, false, toColumnMajor(inverse));
    gl.uniform2f(uniforms.baseTexel, 1 / sourceWidth(baseSource), 1 / sourceHeight(baseSource));
    gl.uniform2f(uniforms.artworkTexel, 1 / sourceWidth(artworkSource), 1 / sourceHeight(artworkSource));
    gl.uniform2f(uniforms.artworkSpan, span.u, span.v);
    gl.uniform1f(uniforms.surfaceLuminance, this.sampler?.measure(corners) ?? 0.5);
    gl.uniform1f(uniforms.shading, settings.shading);
    gl.uniform1f(uniforms.displacement, settings.displacement);
    gl.uniform1f(uniforms.displacementRadius, settings.displacementRadius);
    gl.uniform1f(uniforms.opacity, settings.opacity);
    gl.uniform1f(uniforms.softness, settings.softness);
    gl.uniform1f(uniforms.grain, settings.grain);
  }

  render(corners: MockupQuad, settings: SmartObjectSettings, width: number, height: number): HTMLCanvasElement | null {
    const inverse = solveQuadToUnitSquare(corners);
    if (!inverse || !this.baseSource || !this.artworkSource) return null;

    const { gl } = this;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    this.bindTextures();
    this.applyUniforms(corners, settings, inverse, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, VERTEX_COUNT);
    return this.canvas;
  }

  dispose(): void {
    const { gl } = this;
    gl.deleteTexture(this.baseTexture);
    gl.deleteTexture(this.artworkTexture);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
