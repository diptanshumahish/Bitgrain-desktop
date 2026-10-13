import React, { useRef } from 'react'
import type { ImageLayer } from '../../../data/studioTypes'
import type { HandleDir } from './SelectionHandles'
import { SelectionHandles } from './SelectionHandles'
import { useLayerDrag } from '../hooks/useLayerDrag'
import { composeLayerFilter } from '../../../utils/filter-utils'
import { usePhotoLookPreview } from '../../../modules/grading/studio/use-photo-look-preview'
import { lookFromLayer } from '../../../modules/grading/studio/photo-look'
import { resolveAssetUrl } from '../../../lib/api-client'
import { PIXELATE_MIN_SCALE } from '../canvas/canvas-transform'
import { useSignalValue } from '../../../lib/signal'
import { cropImageStyle } from '../../../utils/image-crop'
import { cropLayerIdSignal, enterCropMode } from './crop/crop-mode-signal'
import { useCropInteraction } from './crop/use-crop-interaction'
import { CropGhost } from './crop/CropGhost'
import type { ImageCrop } from '../../../data/studioTypes'

interface ImageLayerViewProps {
  layer: ImageLayer
  image: string | null
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

const OBJECT_FIT: Record<ImageLayer['fit'], React.CSSProperties['objectFit']> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'fill',
}

export const ImageLayerView: React.FC<ImageLayerViewProps> = ({
  layer, image, selected, scale, zIndex, hideSelectionUi, interactive,
  onSelect, onMoveDelta, onMoveEnd, onResizeDelta, onResizeEnd, onContextMenu, onCropChange,
}) => {
  const showChrome = selected && !hideSelectionUi
  const effectiveImage = resolveAssetUrl(layer.src) ?? image
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const cropping = useSignalValue(cropLayerIdSignal) === layer.id && !!effectiveImage
  const drag = useLayerDrag({ onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive, blocked: cropping })
  const cropDrag = useCropInteraction({
    active: cropping, fit: layer.fit, crop: layer.crop, width: layer.width, height: layer.height,
    scale, flipH: layer.flipH, flipV: layer.flipV, wrapRef, imgRef, onCropChange,
  })
  const pointer = cropping ? cropDrag : drag
  const effectPreviewSrc = usePhotoLookPreview(effectiveImage, lookFromLayer(layer))
  const renderSrc = effectPreviewSrc ?? effectiveImage

  return (
    <div
      ref={wrapRef}
      className="absolute !overflow-visible bg-transparent origin-center"
      style={{
        left: layer.x, top: layer.y,
        width: layer.width, height: layer.height,
        opacity: layer.opacity,
        borderRadius: layer.borderRadius,
        zIndex,
        cursor: cropping ? 'grab' : selected ? 'move' : 'default',
        outline: cropping ? `${2 / scale}px solid var(--s-canvas-selection)` : showChrome ? `${2 / scale}px solid var(--s-handle)` : undefined,
        outlineOffset: 1 / scale,
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
        filter: composeLayerFilter(layer.filters, layer.shadow),
        transform: `rotate(${layer.rotation ?? 0}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
      }}
      onClick={(e) => { e.stopPropagation(); if (!drag.directSelect) onSelect(e.shiftKey) }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onDoubleClick={(e) => { if (!effectiveImage) return; e.stopPropagation(); enterCropMode(layer.id) }}
      onPointerDown={pointer.onPointerDown}
      onPointerMove={pointer.onPointerMove}
      onPointerUp={pointer.onPointerUp}
    >
      {cropping && renderSrc && (
        <CropGhost src={renderSrc} fit={layer.fit} crop={layer.crop} width={layer.width} height={layer.height} scale={scale} />
      )}
      <div className="w-full h-full relative overflow-hidden rounded-[inherit]">
        {effectiveImage ? (
          <img
            ref={imgRef}
            src={renderSrc ?? effectiveImage}
            draggable={false}
            className="w-full h-full block pointer-events-none"
            style={{
              ...cropImageStyle(layer.crop),
              objectFit: OBJECT_FIT[layer.fit],
              imageRendering: scale >= PIXELATE_MIN_SCALE ? "pixelated" : "auto",
            }}
          />
        ) : (
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\'%3E%3Crect width=\'8\' height=\'8\' fill=\'%23cccccc\'/%3E%3Crect x=\'8\' y=\'8\' width=\'8\' height=\'8\' fill=\'%23cccccc\'/%3E%3Crect x=\'8\' y=\'0\' width=\'8\' height=\'8\' fill=\'%23ffffff\'/%3E%3Crect x=\'0\' y=\'8\' width=\'8\' height=\'8\' fill=\'%23ffffff\'/%3E%3C/svg%3E")',
            backgroundSize: `${16 / scale}px ${16 / scale}px`,
          }} />
        )}
      </div>

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
