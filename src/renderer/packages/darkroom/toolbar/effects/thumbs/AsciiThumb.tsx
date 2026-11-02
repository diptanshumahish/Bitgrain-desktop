import React from "react";

const LINES = ["@#*+=", "#*+=-", "*+=-:", "+=-:."];
const LINE_HEIGHT = 9;
const TOP = 9.5;

export const AsciiThumb: React.FC = () => (
  <svg aria-hidden="true" viewBox="0 0 40 40" className="w-full h-full">
    <g fill="currentColor" fontFamily="ui-monospace, monospace" fontSize="9.5" fontWeight="700">
      {LINES.map((line, index) => (
        <text key={line} x="2" y={TOP + index * LINE_HEIGHT} xmlSpace="preserve" textLength="36" lengthAdjust="spacing">
          {line}
        </text>
      ))}
    </g>
  </svg>
);
