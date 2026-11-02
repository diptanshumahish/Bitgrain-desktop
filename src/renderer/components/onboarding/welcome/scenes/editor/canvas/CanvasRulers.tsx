import React from "react";

const TICKS = "bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0_1px,transparent_1px_10px)]";
const TICKS_VERTICAL = "bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.18)_0_1px,transparent_1px_10px)]";

export const CanvasRulers: React.FC = () => (
  <>
    <div aria-hidden="true" className={`absolute left-5 right-0 top-0 h-5 border-b border-white/10 bg-[#121212] ${TICKS} bg-[size:100%_6px] bg-bottom bg-no-repeat`} />
    <div aria-hidden="true" className={`absolute bottom-0 left-0 top-5 w-5 border-r border-white/10 bg-[#121212] ${TICKS_VERTICAL} bg-[size:6px_100%] bg-right bg-no-repeat`} />
    <div aria-hidden="true" className="absolute left-0 top-0 h-5 w-5 border-b border-r border-white/10 bg-[#121212]" />
  </>
);
