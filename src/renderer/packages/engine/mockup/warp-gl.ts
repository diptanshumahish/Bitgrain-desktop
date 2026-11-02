import { WARP_FRAGMENT_SHADER, WARP_VERTEX_SHADER } from "./warp-shaders";
import type { Matrix3x3 } from "./mockup-types";

export const toColumnMajor = (matrix: Matrix3x3): Float32Array => {
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

export const linkProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
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

export const createTexture = (gl: WebGL2RenderingContext, withMipmaps: boolean): WebGLTexture => {
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

export const uploadRawTexture = (gl: WebGL2RenderingContext, texture: WebGLTexture, unit: number, source: TexImageSource): void => {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
};

export const sourceWidth = (source: TexImageSource): number =>
  (source as { width?: number }).width ?? (source as { videoWidth?: number }).videoWidth ?? 1;

export const sourceHeight = (source: TexImageSource): number =>
  (source as { height?: number }).height ?? (source as { videoHeight?: number }).videoHeight ?? 1;
