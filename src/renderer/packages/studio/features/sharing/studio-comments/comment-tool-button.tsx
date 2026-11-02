import React from "react";
import { MessageCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import { commentModeSignal } from "../comment-state/comment-ui-store";
import { toggleCommentMode } from "../comment-state/comment-mode";
import { ToolTileContent } from "../../../adder/tool-tile";
import { TOOL_TILE_CLASS, TOOL_TILE_ICON_SIZE, toolTileTone } from "../../../adder/tool-tile-styles";

export const CommentToolButton: React.FC = () => {
  const active = useSignalValue(commentModeSignal);
  const { workId } = useParams<{ workId?: string }>();
  if (!workId) return null;
  return (
    <Tooltip content="Comment (C)">
      <button
        type="button"
        onClick={toggleCommentMode}
        aria-label="Comment (C)"
        aria-pressed={active}
        className={`${TOOL_TILE_CLASS} rounded-xl ${toolTileTone(active)}`}
      >
        <ToolTileContent icon={<MessageCircle size={TOOL_TILE_ICON_SIZE} strokeWidth={1.75} />} label="Comment" />
      </button>
    </Tooltip>
  );
};
