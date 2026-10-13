import { cropImageStyle } from "../../utils/image-crop";
import React from "react";
import type {
  TemplateDef,
  Layer,
  TextLayer,
  ShapeLayer,
  UploadLayer,
  VectorLayer,
  VectorFillFit,
} from "../../data/studioTypes";
import { resolveAssetUrl } from "../../lib/api-client";
import { pickSampleImage } from "../../data/templates/sample-images";
import { vectorPathToD } from "../../utils/vector-utils";
import { laidOutChildren } from "../../utils/auto-layout";
import { constructFilterString } from "../../utils/filter-utils";
import { buildBaseTextStyle, applyTransform } from "../studio/layers/text-style-utils";
import { SvgTextRenderer } from "../studio/layers/SvgTextRenderer";
import { useSignalValue } from "../../lib/signal";
import { customFontsReadySignal } from "../../lib/admin-fonts";

const flattenLayers = (
  layers: Layer[],
  offsetX = 0,
  offsetY = 0,
): Layer[] => {
  const out: Layer[] = [];
  for (const layer of layers) {
    if (!layer.visible) continue;
    if (layer.type === "group") {
      out.push(
        ...flattenLayers(
          laidOutChildren(layer),
          offsetX + layer.x,
          offsetY + layer.y,
        ),
      );
      continue;
    }
    if (layer.type === "frame") {
      out.push(...flattenLayers(layer.layers, offsetX + layer.x, offsetY + layer.y));
      continue;
    }
    out.push({ ...layer, x: layer.x + offsetX, y: layer.y + offsetY });
  }
  return out;
};

const starPolygon = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  irx: number,
  iry: number,
  points: number,
): string => {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const [ox, oy] = i % 2 === 0 ? [rx, ry] : [irx, iry];
    out.push(`${cx + ox * Math.cos(angle)},${cy + oy * Math.sin(angle)}`);
  }
  return out.join(" ");
};

const regularPolygon = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  sides: number,
): string => {
  const out: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    out.push(`${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`);
  }
  return out.join(" ");
};

const vectorFillAspect = (fit: VectorFillFit): string => {
  if (fit === "stretch") return "none";
  if (fit === "cover") return "xMidYMid slice";
  return "xMidYMid meet";
};

const buildThumbnailShapeSvg = (layer: ShapeLayer): React.ReactNode => {
  const { shapeType, fill, stroke, strokeWidth: sw, borderRadius: br } = layer;
  const W = layer.width;
  const H = layer.height;
  const cx = W / 2;
  const cy = H / 2;
  const margin = sw / 2;
  const rx = cx - margin;
  const ry = cy - margin;

  switch (shapeType) {
    case "rect":
      return (
        <rect
          x={margin}
          y={margin}
          width={W - sw}
          height={H - sw}
          rx={br}
          ry={br}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case "circle":
      return (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case "triangle":
      return (
        <polygon
          points={`${cx},${margin} ${W - margin},${H - margin} ${margin},${H - margin}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case "diamond":
      return (
        <polygon
          points={`${cx},${margin} ${W - margin},${cy} ${cx},${H - margin} ${margin},${cy}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case "star":
      return (
        <polygon
          points={starPolygon(cx, cy, rx, ry, rx * 0.42, ry * 0.42, 5)}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case "pentagon":
      return (
        <polygon
          points={regularPolygon(cx, cy, rx, ry, 5)}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case "hexagon":
      return (
        <polygon
          points={regularPolygon(cx, cy, rx, ry, 6)}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      );
    case "line":
      return (
        <line
          x1={0}
          y1={cy}
          x2={W}
          y2={cy}
          stroke={stroke || fill}
          strokeWidth={Math.max(sw, 2)}
          strokeLinecap="round"
        />
      );
    case "arrow": {
      const head = Math.min(W * 0.2, H * 0.5, 30);
      return (
        <path
          d={`M${margin},${cy} L${W - head},${cy} M${W - head},${cy - head * 0.6} L${W - margin},${cy} L${W - head},${cy + head * 0.6}`}
          fill="none"
          stroke={stroke || fill}
          strokeWidth={Math.max(sw, 2)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
    case "frame-thin": {
      const t = 3;
      return (
        <rect
          x={t}
          y={t}
          width={W - t * 2}
          height={H - t * 2}
          fill="none"
          stroke={fill || stroke}
          strokeWidth={t}
        />
      );
    }
    case "frame-thick": {
      const t = Math.min(W, H) * 0.08;
      return (
        <rect
          x={t / 2}
          y={t / 2}
          width={W - t}
          height={H - t}
          fill="none"
          stroke={fill || stroke}
          strokeWidth={t}
        />
      );
    }
    case "frame-double": {
      const o = 4;
      const inn = 10;
      return (
        <>
          <rect
            x={o / 2}
            y={o / 2}
            width={W - o}
            height={H - o}
            fill="none"
            stroke={fill || stroke}
            strokeWidth={2}
          />
          <rect
            x={inn}
            y={inn}
            width={W - inn * 2}
            height={H - inn * 2}
            fill="none"
            stroke={fill || stroke}
            strokeWidth={2}
          />
        </>
      );
    }
    case "frame-round": {
      const t = 5;
      const cr = Math.min(W, H) * 0.15;
      return (
        <rect
          x={t / 2}
          y={t / 2}
          width={W - t}
          height={H - t}
          rx={cr}
          ry={cr}
          fill="none"
          stroke={fill || stroke}
          strokeWidth={t}
        />
      );
    }
    default:
      return null;
  }
};

interface TemplateThumbnailProps {
  template: TemplateDef;
}

export const TemplateThumbnail: React.FC<TemplateThumbnailProps> = ({
  template,
}) => {
  const customFontsVersion = useSignalValue(customFontsReadySignal);
  return (
  <div
    className="w-full relative overflow-hidden"
    style={{
      aspectRatio: `${template.width} / ${template.height}`,
      background: template.background,
    }}
  >
    {template.id === "blank-canvas" && (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 m-4 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-500 dark:text-zinc-400 text-xl font-bold">
            +
          </span>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400     ">
          Empty Frame
        </span>
      </div>
    )}
    {flattenLayers(template.layers).map((layer: Layer) => {
      const percentX = (layer.x / template.width) * 100;
      const percentY = (layer.y / template.height) * 100;
      const percentW = (layer.width / template.width) * 100;
      const percentH = (layer.height / template.height) * 100;

      if (layer.type === "image")
        return (
          <img
            key={layer.id}
            src={
              resolveAssetUrl(layer.src) ??
              resolveAssetUrl(template.image) ??
              pickSampleImage(template.id, layer.id)
            }
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute object-cover"
            style={{
              left: `${percentX}%`,
              top: `${percentY}%`,
              width: `${percentW}%`,
              height: `${percentH}%`,
              opacity: layer.opacity,
              filter: constructFilterString(layer.filters),
              mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
              transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
            }}
          />
        );

      if (layer.type === "upload") {
        const uploadLayer = layer as UploadLayer;
        const src =
          resolveAssetUrl(uploadLayer.src) ??
          resolveAssetUrl(template.image) ??
          pickSampleImage(template.id, layer.id);
        const radius =
          uploadLayer.borderRadius > 0
            ? `${Math.min(50, (uploadLayer.borderRadius / Math.min(uploadLayer.width, uploadLayer.height)) * 100)}%`
            : undefined;
        return (
          <div
            key={layer.id}
            className="absolute overflow-hidden"
            style={{
              left: `${percentX}%`,
              top: `${percentY}%`,
              width: `${percentW}%`,
              height: `${percentH}%`,
              opacity: layer.opacity,
              borderRadius: radius,
              filter: constructFilterString(uploadLayer.filters),
              mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
              transform: uploadLayer.rotation
                ? `rotate(${uploadLayer.rotation}deg)`
                : undefined,
            }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="w-full h-full block"
              style={{ ...cropImageStyle(uploadLayer.crop), objectFit: uploadLayer.fit }}
            />
          </div>
        );
      }

      if (layer.type === "vector") {
        const vectorLayer = layer as VectorLayer;
        const fillImage = vectorLayer.fillImage;
        const patternId = `vfill-thumb-${vectorLayer.id}`;
        const pathFill = fillImage ? `url(#${patternId})` : vectorLayer.fill;
        const strokeWidth =
          vectorLayer.strokeWidth > 0 && vectorLayer.width > 0
            ? (vectorLayer.strokeWidth * 100) / vectorLayer.width
            : vectorLayer.strokeWidth;
        return (
          <div
            key={layer.id}
            className="absolute origin-center"
            style={{
              left: `${percentX}%`,
              top: `${percentY}%`,
              width: `${percentW}%`,
              height: `${percentH}%`,
              opacity: layer.opacity,
              transform: vectorLayer.rotation
                ? `rotate(${vectorLayer.rotation}deg)`
                : undefined,
            }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full block overflow-visible"
            >
              {fillImage && (
                <defs>
                  <pattern
                    id={patternId}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    patternUnits="userSpaceOnUse"
                  >
                    <image
                      href={resolveAssetUrl(fillImage.src) ?? fillImage.src}
                      x="0"
                      y="0"
                      width="100"
                      height="100"
                      preserveAspectRatio={vectorFillAspect(fillImage.fit)}
                    />
                  </pattern>
                </defs>
              )}
              <path
                d={vectorPathToD(vectorLayer.path)}
                fill={pathFill}
                stroke={vectorLayer.strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap={vectorLayer.lineCap}
                strokeLinejoin={vectorLayer.lineJoin}
              />
            </svg>
          </div>
        );
      }

      if (layer.type === "shape") {
        const shapeLayer = layer as ShapeLayer;
        return (
          <div
            key={layer.id}
            className="absolute origin-center"
            style={{
              left: `${percentX}%`,
              top: `${percentY}%`,
              width: `${percentW}%`,
              height: `${percentH}%`,
              opacity: layer.opacity,
              transform: shapeLayer.rotation
                ? `rotate(${shapeLayer.rotation}deg)`
                : undefined,
            }}
          >
            <svg
              viewBox={`0 0 ${shapeLayer.width} ${shapeLayer.height}`}
              preserveAspectRatio="none"
              className="w-full h-full block overflow-visible"
            >
              {buildThumbnailShapeSvg(shapeLayer)}
            </svg>
          </div>
        );
      }

      if (layer.type === "text") {
        const textLayer = layer as TextLayer;
        const isPlainText =
          !textLayer.richContent && (textLayer.effects?.length ?? 0) === 0;
        const firstLineLeading =
          ((textLayer.lineHeight - 1) * textLayer.fontSize) / 2;
        const html = textLayer.richContent
          ? textLayer.richContent
          : applyTransform(textLayer.content, textLayer.textTransform);
        return (
          <div
            key={`${layer.id}-${customFontsVersion}`}
            className="absolute overflow-visible origin-center"
            style={{
              left: `${percentX}%`,
              top: `${percentY}%`,
              width: `${percentW}%`,
              height: `${percentH}%`,
              opacity: layer.opacity,
              transform: textLayer.rotation
                ? `rotate(${textLayer.rotation}deg)`
                : undefined,
            }}
          >
            {isPlainText ? (
              <SvgTextRenderer layer={textLayer} responsive />
            ) : (
              <svg
                viewBox={`0 0 ${textLayer.width} ${textLayer.height}`}
                preserveAspectRatio="xMinYMin meet"
                className="w-full h-full block overflow-visible"
              >
                <foreignObject
                  x={0}
                  y={0}
                  width={textLayer.width}
                  height={textLayer.height}
                  overflow="visible"
                >
                  <div
                    style={{
                      ...buildBaseTextStyle(textLayer),
                      width: textLayer.width,
                      height: textLayer.height,
                      marginTop: -firstLineLeading,
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </foreignObject>
              </svg>
            )}
          </div>
        );
      }

      return null;
    })}

    {template.overlay && (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(${
            template.overlay.y0 > template.overlay.y1 ? "to top" : "to bottom"
          }, ${template.overlay.stops.map((s) => `${s.color} ${s.pos * 100}%`).join(", ")})`,
        }}
      />
    )}
  </div>
  );
};
