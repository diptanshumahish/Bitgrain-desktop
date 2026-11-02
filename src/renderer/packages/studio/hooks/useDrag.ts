import { useRef, useCallback, useEffect } from 'react'

// Lock movement to the horizontal or vertical line through the start point,
// choosing the axis the pointer has travelled furthest along.
const constrainToAxis = (dx: number, dy: number): { x: number; y: number } =>
  Math.abs(dx) >= Math.abs(dy) ? { x: dx, y: 0 } : { x: 0, y: dy }

const DRAG_THRESHOLD_PX = 3
const RELEASE_EVENTS = ['pointerup', 'pointercancel'] as const

export const useDrag = (
  onDelta: (dx: number, dy: number) => void,
  scale: number,
  disabled = false,
  onPress?: (e: React.PointerEvent) => void,
  onMissedEnd?: () => void,
) => {
  const start = useRef<{ x: number; y: number } | null>(null)
  const applied = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const captured = useRef(false)
  const missedEndRef = useRef(onMissedEnd)
  const releaseListeners = useRef<AbortController | null>(null)

  useEffect(() => {
    missedEndRef.current = onMissedEnd
  }, [onMissedEnd])

  const reset = useCallback((): boolean => {
    releaseListeners.current?.abort()
    releaseListeners.current = null
    const didDrag = captured.current
    start.current = null
    applied.current = { x: 0, y: 0 }
    captured.current = false
    return didDrag
  }, [])

  // The element never saw the release (let go off-element, re-rendered mid-drag,
  // or the browser cancelled the pointer), so finish the gesture from here.
  const finishMissedRelease = useCallback(() => {
    if (reset()) missedEndRef.current?.()
  }, [reset])

  const listenForRelease = useCallback(() => {
    const controller = new AbortController()
    releaseListeners.current = controller
    RELEASE_EVENTS.forEach((type) => window.addEventListener(type, finishMissedRelease, { signal: controller.signal }))
  }, [finishMissedRelease])

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
    if (e.buttons === 0) {
      finishMissedRelease()
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
      listenForRelease()
    }
    const rawX = (e.clientX - start.current.x) / scale
    const rawY = (e.clientY - start.current.y) / scale
    const target = e.shiftKey ? constrainToAxis(rawX, rawY) : { x: rawX, y: rawY }
    const dx = target.x - applied.current.x
    const dy = target.y - applied.current.y
    applied.current = target
    if (dx !== 0 || dy !== 0) onDelta(dx, dy)
  }, [onDelta, scale, finishMissedRelease, listenForRelease])

  const onPointerUp = useCallback((): boolean => reset(), [reset])

  return { onPointerDown, onPointerMove, onPointerUp }
}
