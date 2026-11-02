import { createTexture, linkProgram, sourceHeight, sourceWidth, toColumnMajor, uploadRawTexture } from "./warp-gl";
import { readUniformLocations, type UniformLocations } from "./warp-uniforms";
import { solveQuadToUnitSquare } from "./homography";
import { SurfaceSampler } from "./surface-luminance";
import { containArtworkSpan, quadAspectRatio, FULL_SPAN } from "./quad-metrics";
import type { ArtworkSpan } from "./quad-metrics";
import type { Matrix3x3, MockupQuad, SmartObjectSettings } from "./mockup-types";

const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);
const VERTEX_COMPONENTS = 2;
const VERTEX_COUNT = 3;
const FALLBACK_LUMINANCE = 0.5;

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
  private readonly surfaceTexture: WebGLTexture;
  private readonly lightTexture: WebGLTexture;
  private baseSource: TexImageSource | null = null;
  private artworkSource: TexImageSource | null = null;
  private sampler: SurfaceSampler | null = null;
  private surfaceSource: TexImageSource | null = null;
  private lightSource: TexImageSource | null = null;
  private uploadedLight: TexImageSource | null = null;
  private lightMean = FALLBACK_LUMINANCE;

  constructor() {
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("webgl2", { premultipliedAlpha: false, antialias: false });
    if (!context) throw new Error("webgl2 is not available");
    this.gl = context;
    this.program = linkProgram(this.gl);
    this.uniforms = readUniformLocations(this.gl, this.program);
    this.baseTexture = createTexture(this.gl, false);
    this.artworkTexture = createTexture(this.gl, true);
    this.surfaceTexture = createTexture(this.gl, false);
    this.lightTexture = createTexture(this.gl, true);
    this.setupGeometry();
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
    this.surfaceSource = null;
    this.lightSource = null;
    if (this.baseSource === base) return;
    this.uploadTexture(this.baseTexture, 0, base, false);
    this.baseSource = base;
    this.sampler = new SurfaceSampler(base);
  }

  setSurface(surface: TexImageSource | null): void {
    if (surface && surface !== this.surfaceSource) uploadRawTexture(this.gl, this.surfaceTexture, 2, surface);
    this.surfaceSource = surface;
  }

  setLight(light: TexImageSource | null, mean: number): void {
    if (light && light !== this.uploadedLight) {
      this.uploadTexture(this.lightTexture, 3, light, true);
      this.uploadedLight = light;
    }
    this.lightSource = light;
    this.lightMean = mean;
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
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.surfaceTexture);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.lightTexture);
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
    surfaceLuminance?: number,
  ): void {
    const { gl, uniforms, baseSource, artworkSource } = this;
    if (!baseSource || !artworkSource) return;
    const span = this.resolveSpan(corners, settings, width, height);
    gl.uniform1i(uniforms.base, 0);
    gl.uniform1i(uniforms.artwork, 1);
    gl.uniform1i(uniforms.surface, 2);
    gl.uniform1f(uniforms.hasSurface, this.surfaceSource ? 1 : 0);
    gl.uniform1i(uniforms.light, 3);
    gl.uniform1f(uniforms.hasLight, this.lightSource ? 1 : 0);
    gl.uniform1f(uniforms.lightMean, this.lightMean);
    gl.uniformMatrix3fv(uniforms.inverseHomography, false, toColumnMajor(inverse));
    gl.uniform2f(uniforms.baseTexel, 1 / sourceWidth(baseSource), 1 / sourceHeight(baseSource));
    gl.uniform2f(uniforms.artworkTexel, 1 / sourceWidth(artworkSource), 1 / sourceHeight(artworkSource));
    gl.uniform2f(uniforms.artworkSpan, span.u, span.v);
    gl.uniform1f(uniforms.surfaceLuminance, surfaceLuminance ?? this.sampler?.measure(corners) ?? FALLBACK_LUMINANCE);
    gl.uniform1f(uniforms.shading, settings.shading);
    gl.uniform1f(uniforms.displacement, settings.displacement);
    gl.uniform1f(uniforms.displacementRadius, settings.displacementRadius);
    gl.uniform1f(uniforms.opacity, settings.opacity);
    gl.uniform1f(uniforms.softness, settings.softness);
    gl.uniform1f(uniforms.grain, settings.grain);
    gl.uniform1f(uniforms.fabricDetail, settings.fabricDetail ?? 0);
    gl.uniform1f(uniforms.lightTint, settings.lightTint ?? 0);
    gl.uniform1f(uniforms.inkSheen, settings.inkSheen ?? 0);
  }

  render(
    corners: MockupQuad,
    settings: SmartObjectSettings,
    width: number,
    height: number,
    surfaceLuminance?: number,
  ): HTMLCanvasElement | null {
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
    this.applyUniforms(corners, settings, inverse, width, height, surfaceLuminance);
    gl.drawArrays(gl.TRIANGLES, 0, VERTEX_COUNT);
    return this.canvas;
  }

  dispose(): void {
    const { gl } = this;
    gl.deleteTexture(this.baseTexture);
    gl.deleteTexture(this.artworkTexture);
    gl.deleteTexture(this.surfaceTexture);
    gl.deleteTexture(this.lightTexture);
    gl.deleteProgram(this.program);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
