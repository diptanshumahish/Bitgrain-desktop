import { useRef, useCallback } from 'react'

// Lock movement to the horizontal or vertical line through the start point,
// choosing the axis the pointer has travelled furthest along.
const constrainToAxis = (dx: number, dy: number): { x: number; y: number } =>
  Math.abs(dx) >= Math.abs(dy) ? { x: dx, y: 0 } : { x: 0, y: dy }

const DRAG_THRESHOLD_PX = 3

export const useDrag = (
  onDelta: (dx: number, dy: number) => void,
  scale: number,
  disabled = false,
  onPress?: (e: React.PointerEvent) => void,
) => {
  const start = useRef<{ x: number; y: number } | null>(null)
  const applied = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const captured = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return
    e.stopPropagation()
    start.current = { x: e.clientX, y: e.clientY }
    applied.current = { x: 0, y: 0 }
    captured.current = false
    onPress?.(e)
  }, [disabled, onPress])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!start.current) return
    // A missed pointer-up (released off-window, or the element re-rendered mid-drag)
    // leaves the start ref set. Without this guard a button-less hover would keep dragging.
    if (e.buttons === 0) {
      start.current = null
      applied.current = { x: 0, y: 0 }
      captured.current = false
      return
    }
    if (!captured.current) {
      const movedPx = Math.max(
        Math.abs(e.clientX - start.current.x),
        Math.abs(e.clientY - start.current.y),
      )
      if (movedPx < DRAG_THRESHOLD_PX) return
      captured.current = true
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    const rawX = (e.clientX - start.current.x) / scale
    const rawY = (e.clientY - start.current.y) / scale
    const target = e.shiftKey ? constrainToAxis(rawX, rawY) : { x: rawX, y: rawY }
    const dx = target.x - applied.current.x
    const dy = target.y - applied.current.y
    applied.current = target
    if (dx !== 0 || dy !== 0) onDelta(dx, dy)
  }, [onDelta, scale])

  const onPointerUp = useCallback((): boolean => {
    const didDrag = captured.current
    start.current = null
    applied.current = { x: 0, y: 0 }
    captured.current = false
    return didDrag
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp }
}
