import React, { useState } from "react";

interface NumberCommitInputProps {
  value: number;
  min: number;
  onCommit: (value: number) => void;
  className?: string;
}

export const NumberCommitInput: React.FC<NumberCommitInputProps> = ({
  value,
  min,
  onCommit,
  className,
}) => {
  const [text, setText] = useState(String(value));
  const [lastValue, setLastValue] = useState(value);

  if (value !== lastValue) {
    setLastValue(value);
    setText(String(value));
  }

  const commit = (): void => {
    const parsed = Number(text);
    const next = Number.isFinite(parsed) ? Math.max(min, Math.round(parsed)) : value;
    setText(String(next));
    if (next !== value) onCommit(next);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setText(String(value));
          event.currentTarget.blur();
        }
      }}
      className={className}
    />
  );
};
