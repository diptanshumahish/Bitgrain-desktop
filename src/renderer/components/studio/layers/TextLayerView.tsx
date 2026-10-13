import React, { useCallback, useEffect, useRef } from "react";
import type { TextLayer } from "../../../data/studioTypes";
import type { HandleDir } from "./SelectionHandles";
import { SelectionHandles } from "./SelectionHandles";
import { useLayerDrag } from "../hooks/useLayerDrag";
import { SvgTextRenderer } from "./SvgTextRenderer";
import {
  applyTransform,
  buildBaseTextStyle,
  buildShadowCss,
  normalizeText,
} from "./text-style-utils";
import { cleanRichHtml } from "../rich-text/rich-text-apply";
import {
  registerEditor,
  unregisterEditor,
  updateEditorBase,
  refreshSelection,
  showSavedHighlight,
  clearHighlight,
  endSelectionPreview,
} from "../rich-text/text-edit-bus";
import { layerBaseStyle } from "../rich-text/rich-text-read";
import { handleEditorClickSelection } from "../rich-text/text-click-select";
import { handleFormatShortcut } from "../rich-text/format-shortcuts";
import { NEW_TEXT_CONTENT } from "../../../utils/studio-layers";
import { halfLeading } from "../../../utils/text-block-height";
import { useSignalValue } from "../../../lib/signal";
import { textPreviewSignal, withTextPreview } from "../fonts/text-preview-signal";

interface TextLayerViewProps {
  layer: TextLayer;
  selected: boolean;
  editing: boolean;
  scale: number;
  zIndex?: number;
  hideSelectionUi?: boolean;
  interactive?: boolean;
  onSelect: (multi?: boolean) => void;
  onStartEdit: () => void;
  onEndEdit: (content: string, richContent: string) => void;
  onCommitText: (content: string, richContent: string) => void;
  onMoveDelta: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const TextLayerView: React.FC<TextLayerViewProps> = ({
  layer: storedLayer, selected, editing, scale, zIndex, hideSelectionUi, interactive,
  onSelect, onStartEdit, onEndEdit, onCommitText, onMoveDelta, onMoveEnd,
  onResizeDelta, onResizeEnd, onContextMenu,
}) => {
  const layer = withTextPreview(storedLayer, useSignalValue(textPreviewSignal));
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const wasSelectedOnPress = useRef(false);
  const drag = useLayerDrag({
    onMoveDelta, onMoveEnd, scale, selected, onSelect, interactive,
    blocked: editing,
    onBeforePress: () => { wasSelectedOnPress.current = selected; },
  });
  const showChrome = selected && !hideSelectionUi;

  const effects = layer.effects ?? [];
  const baseStyle = buildBaseTextStyle(layer);
  const leading = halfLeading(layer.fontSize, layer.lineHeight);
  const leadingTrim = { marginTop: -leading, marginBottom: -leading };

  const baseRef = useRef(layerBaseStyle(storedLayer));
  const commitTextRef = useRef(onCommitText);
  const endEditRef = useRef(onEndEdit);

  useEffect(() => {
    baseRef.current = layerBaseStyle(storedLayer);
    commitTextRef.current = onCommitText;
    endEditRef.current = onEndEdit;
  });

  const commitNow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    commitTextRef.current(normalizeText(el), cleanRichHtml(el.innerHTML));
  }, []);

  const endNow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    endSelectionPreview();
    endEditRef.current(normalizeText(el), cleanRichHtml(el.innerHTML));
  }, []);

  useEffect(() => {
    if (editing) return;
    const el = ref.current;
    if (!el) return;
    if (layer.richContent) {
      if (el.innerHTML !== layer.richContent) el.innerHTML = layer.richContent;
    } else {
      const processed = applyTransform(layer.content, layer.textTransform);
      if (el.innerHTML !== processed) el.innerHTML = processed;
    }
  }, [layer.content, layer.richContent, layer.textTransform, editing]);

  useEffect(() => {
    if (!editing || !ref.current) return;
    const el = ref.current;
    if (layer.richContent) {
      el.innerHTML = layer.richContent;
    } else {
      el.innerText = layer.content;
    }
    const range = document.createRange();
    range.selectNodeContents(el);
    if (layer.content !== NEW_TEXT_CONTENT) range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    el.focus();
    // initial population on enter-edit only; subsequent content changes are handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  useEffect(() => {
    const el = ref.current;
    if (!editing || !el) return;
    registerEditor({ editorEl: el, base: baseRef.current, commit: commitNow });
    const onSelectionChange = () => refreshSelection();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (wrapRef.current?.contains(target)) return;
      if (target.closest('[data-tutorial="studio-properties"]')) return;
      if (target.closest("[data-popover-root]")) return;
      endNow();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("pointerdown", onPointerDown, true);
      unregisterEditor(el);
    };
  }, [editing, commitNow, endNow]);

  useEffect(() => {
    if (editing && ref.current) updateEditorBase(ref.current, baseRef.current);
  }, [editing, layer.color, layer.fontFamily, layer.fontWeight, layer.fontStyle, layer.fontSize, layer.textDecoration, layer.textTransform, layer.letterSpacing]);

  return (
    <div
      ref={wrapRef}
      className="absolute overflow-visible origin-center"
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.autoResize ? "auto" : layer.height,
        minHeight: layer.height,
        opacity: layer.opacity,
        zIndex,
        cursor: editing ? "text" : selected ? "move" : "default",
        outline:
          showChrome || editing
            ? `${1 / scale}px solid var(--s-canvas-selection)`
            : "none",
        outlineOffset: 0,
        mixBlendMode: layer.blendMode as React.CSSProperties["mixBlendMode"],
        transform: `rotate(${layer.rotation ?? 0}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (editing) return;
        if (drag.directSelect) {
          if (!e.shiftKey && wasSelectedOnPress.current && selected) onStartEdit();
          return;
        }
        if (!selected || e.shiftKey) {
          onSelect(e.shiftKey);
          return;
        }
        onStartEdit();
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu?.(e); }}
      onPointerDown={editing ? (e) => e.stopPropagation() : drag.onPointerDown}
      onPointerMove={drag.onPointerMove}
      onPointerUp={drag.onPointerUp}
    >
      <div className="w-full relative min-h-full [overflow-x:clip] overflow-y-visible">
        {editing ? (
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            className="selection:bg-[var(--s-canvas-selection-fill)] selection:text-[var(--text-edit-ink)]"
            onFocus={clearHighlight}
            onBlur={showSavedHighlight}
            onClick={(e) => handleEditorClickSelection(e.detail, e.currentTarget)}
            onKeyDown={(e) => {
              if (handleFormatShortcut(e)) return;
              if (e.key === "Escape") {
                e.preventDefault();
                endNow();
              }
              if (e.key === "Enter") {
                e.preventDefault();
                document.execCommand("insertLineBreak");
              }
            }}
            style={{
              ...baseStyle,
              ...leadingTrim,
              ["--text-edit-ink" as string]: layer.color,
              background: "none",
              WebkitBackgroundClip: "unset",
              WebkitTextFillColor: layer.gradientText?.enabled ? "unset" : undefined,
              backgroundClip: "unset",
              color: layer.color,
              userSelect: "text",
              pointerEvents: "auto",
            }}
          />
        ) : effects.length === 0 && (!layer.richContent || layer.gradientText?.enabled) ? (
          <SvgTextRenderer layer={layer} />
        ) : layer.autoResize ? (
          <div
            ref={ref}
            style={{ ...baseStyle, ...leadingTrim, userSelect: "none", pointerEvents: "none" }}
            dangerouslySetInnerHTML={
              layer.richContent
                ? { __html: layer.richContent }
                : { __html: applyTransform(layer.content, layer.textTransform) }
            }
          />
        ) : (
          <div
            ref={ref}
            style={{
              ...baseStyle,
              marginTop: -leading,
              fontSize: layer.fontSize * scale,
              letterSpacing: layer.letterSpacing * scale,
              ...(effects.length ? { textShadow: buildShadowCss(effects, scale) } : {}),
              width: layer.width * scale,
              height: layer.height * scale,
              transformOrigin: "top left",
              transform: `scale(${1 / scale})`,
              willChange: "transform",
              position: "absolute",
              top: 0,
              left: 0,
              userSelect: "none",
              pointerEvents: "none",
            }}
            dangerouslySetInnerHTML={
              layer.richContent
                ? { __html: layer.richContent }
                : { __html: applyTransform(layer.content, layer.textTransform) }
            }
          />
        )}
      </div>

      {showChrome && !editing && (
        <SelectionHandles
          scale={scale}
          boxWidth={layer.width}
          boxHeight={layer.height}
          onResizeDelta={onResizeDelta}
          onResizeEnd={onResizeEnd}
        />
      )}
    </div>
  );
};
