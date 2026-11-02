import React, { useMemo, useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import type { UploadLayer } from '../../../data/studioTypes'
import type { HandleDir } from './SelectionHandles'
import { SelectionHandles } from './SelectionHandles'
import { useLayerDrag } from '../hooks/useLayerDrag'
import { composeLayerFilter, buildShadowFilter, constructFilterString } from '../../../utils/filter-utils'
import { usePhotoLookPreview } from '../../../modules/grading/studio/use-photo-look-preview'
import { lookFromLayer } from '../../../modules/grading/studio/photo-look'
import { resolveAssetUrl } from '../../../lib/api-client'
import { PIXELATE_MIN_SCALE } from '../canvas/canvas-transform'
import { buildTornEdge, hashStringSeed, polygonToCssClip } from '../../../utils/torn-edge'
import { buildTapePieces } from '../../../utils/tape'
import { useSignalValue } from '../../../lib/signal'
import { cropImageStyle } from '../../../utils/image-crop'
import { cropLayerIdSignal, enterCropMode } from './crop/crop-mode-signal'
import { useCropInteraction } from './crop/use-crop-interaction'
import { CropGhost } from './crop/CropGhost'
import type { ImageCrop } from '../../../data/studioTypes'

interface UploadLayerViewProps {
  layer: UploadLayer
  selected: boolean
  scale: number
  zIndex?: number
  hideSelectionUi?: boolean
  interactive?: boolean
  onSelect: (multi?: boolean) => void
  onMoveDelta: (dx: number, dy: number) => void
  onMoveEnd: () => void
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void
  onResizeEnd: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  onCropChange?: (crop: ImageCrop) => void
}

const FIT: Record<UploadLayer['fit'], React.CSSProperties['objectFit']> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'fill',
}

export const UploadLayerView: React.FC<UploadLayerViewProps> = ({
  layer, selected, scale, zIndex, hideSelectionUi, interactive,
  onSelect, onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onContextMenu, onCropChange,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const cropping = useSignalValue(cropLayerIdSignal) === layer.id && !!layer.src
  const drag = useLayerDrag({ onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive, blocked: cropping })
  const cropDrag = useCropInteraction({
    active: cropping, fit: layer.fit, crop: layer.crop, width: layer.width, height: layer.height,
    scale, flipH: layer.flipH, flipV: layer.flipV, wrapRef, imgRef, onCropChange,
  })
  const pointer = cropping ? cropDrag : drag
  const showChrome = selected && !hideSelectionUi
  const effectiveSrc = resolveAssetUrl(layer.src)
  const effectPreviewSrc = usePhotoLookPreview(effectiveSrc, lookFromLayer(layer))
  const renderSrc = effectPreviewSrc ?? effectiveSrc

  const torn = layer.src ? layer.tornEdge : undefined
  const tape = layer.src ? layer.tape : undefined
  const tornSeed = useMemo(() => hashStringSeed(layer.id), [layer.id])
  const tornClips = useMemo(() => {
    if (!torn) return null
    const geometry = buildTornEdge(layer.width, layer.height, torn, tornSeed)
    return {
      outer: polygonToCssClip(geometry.outer, layer.width, layer.height),
      inner: polygonToCssClip(geometry.inner, layer.width, layer.height),
    }
  }, [torn, layer.width, layer.height, tornSeed])
  const tapePieces = useMemo(
    () => (tape ? buildTapePieces(layer.width, layer.height, tape) : []),
    [tape, layer.width, layer.height],
  )

  return (
    <div
      ref={wrapRef}
      className="absolute overflow-visible origin-center"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        opacity: layer.opacity,
        zIndex,
        borderRadius: torn ? 0 : layer.borderRadius,
        cursor: cropping ? 'grab' : !layer.src ? 'pointer' : (selected ? 'move' : 'default'),
        outline: cropping ? `${2 / scale}px solid var(--s-canvas-selection)` : showChrome ? `${2 / scale}px solid var(--s-handle)` : undefined,
        outlineOffset: 1 / scale,
        background: layer.src ? 'transparent' : 'rgba(100,100,100,0.15)',
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
        filter: torn ? buildShadowFilter(layer.shadow) : composeLayerFilter(layer.filters, layer.shadow),
        transform: `rotate(${layer.rotation ?? 0}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
      }}
      onClick={(e) => { e.stopPropagation(); if (!drag.directSelect) onSelect(e.shiftKey) }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onDoubleClick={(e) => { if (!layer.src) return; e.stopPropagation(); enterCropMode(layer.id) }}
      onPointerDown={pointer.onPointerDown}
      onPointerMove={pointer.onPointerMove}
      onPointerUp={pointer.onPointerUp}
    >
      {cropping && renderSrc && (
        <CropGhost src={renderSrc} fit={layer.fit} crop={layer.crop} width={layer.width} height={layer.height} scale={scale} />
      )}
      {torn && tornClips && torn.border > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: torn.borderColor ?? '#ffffff', clipPath: tornClips.outer }}
        />
      )}
      <div
        className="w-full h-full relative overflow-hidden rounded-[inherit]"
        style={tornClips ? { clipPath: tornClips.inner, borderRadius: 0 } : undefined}
      >
        {layer.src ? (
          <img
            ref={imgRef}
            src={renderSrc ?? effectiveSrc ?? layer.src}
            draggable={false}
            className="w-full h-full block pointer-events-none"
            style={{
              ...cropImageStyle(layer.crop),
              objectFit: FIT[layer.fit],
              filter: torn ? constructFilterString(layer.filters) : undefined,
              imageRendering:
                layer.bitgrainEffect && scale >= PIXELATE_MIN_SCALE
                  ? "pixelated"
                  : undefined,
            }}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center w-full h-full gap-1.5 text-[#888]"
          >
            <ImagePlus size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-editorial">
              Upload image
            </span>
          </div>
        )}
      </div>

      {tape && tapePieces.map((piece, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: piece.cx,
            top: piece.cy,
            width: piece.length,
            height: piece.thickness,
            marginLeft: -piece.length / 2,
            marginTop: -piece.thickness / 2,
            background: tape.color,
            opacity: tape.opacity,
            transform: `rotate(${piece.angle}deg)`,
            transformOrigin: 'center',
          }}
        />
      ))}

      {showChrome && !cropping && (
        <SelectionHandles
          scale={scale}
          boxWidth={layer.width}
          boxHeight={layer.height}
          onResizeDelta={onResizeDelta}
          onResizeEnd={onResizeEnd}
        />
      )}
    </div>
  )
}
