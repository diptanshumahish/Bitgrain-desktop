import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { commentErrorSignal } from "../comments/comments-store";

export const CommentError: React.FC = () => {
  const error = useSignalValue(commentErrorSignal);
  if (!error) return null;
  return (
    <p role="alert" className="px-3 pb-2 text-[11.5px] text-red-600">
      {error}
    </p>
  );
};
