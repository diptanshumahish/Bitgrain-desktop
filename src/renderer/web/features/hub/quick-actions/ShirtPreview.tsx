import React from "react";

const BALCONY_SRC = "/art/apparel-balcony-sm.webp";
const FROCK_SRC = "/art/apparel-frock-sm.webp";

export const ShirtPreview: React.FC = () => (
  <div className="absolute inset-0">
    <img src={BALCONY_SRC} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
    <img
      src={FROCK_SRC}
      alt=""
      className="absolute inset-0 h-full w-full object-cover object-[50%_45%] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
    />
  </div>
);
