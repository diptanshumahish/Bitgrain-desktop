import React from "react";

const PHOTO_SRC = "/art/red-sun-sm.webp";

export const PhotoPreview: React.FC = () => (
  <div className="absolute inset-0">
    <img src={PHOTO_SRC} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 transition-[clip-path] duration-500 ease-out [clip-path:inset(0_0_0_50%)] group-hover:[clip-path:inset(0_0_0_28%)]">
      <img src={PHOTO_SRC} alt="" className="absolute inset-0 h-full w-full object-cover contrast-150 grayscale" />
      <div className="absolute inset-0 bg-amber-300 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_38%,rgba(0,0,0,0.6)_40%)] [background-size:4px_4px]" />
    </div>
    <div className="absolute inset-y-0 left-1/2 w-px bg-white transition-[left] duration-500 ease-out group-hover:left-[28%]">
      <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/40 backdrop-blur-sm" />
    </div>
  </div>
);
