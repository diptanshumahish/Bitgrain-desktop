import React, { useId } from "react";

const WORDMARK = "bitgrain";
const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 300;
const BASELINE = 218;
const FONT_SIZE = 270;
const SIDE_MARGIN = 30;
const SPECKLE_FREQUENCY = "0.4";
const SPECKLE_ALPHA = "-16 0 0 0 11.2";
const MOTTLE_FREQUENCY = "0.012";
const MOTTLE_ALPHA = "-0.6 0 0 0 1.3";
const EDGE_FREQUENCY = "0.045";
const EDGE_ROUGHNESS = 4;
const NOISE_OCTAVES = 2;
const SPECKLE_SEED = 3;
const MOTTLE_SEED = 11;
const EDGE_SEED = 7;
const ZERO_ROWS = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0";

export const RoughWordmark: React.FC = () => {
  const filterId = useId();

  return (
    <svg role="img" aria-label="Bitgrain" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="block w-full h-auto">
      <defs>
        <filter id={filterId} x="-2%" y="-5%" width="104%" height="110%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={SPECKLE_FREQUENCY} numOctaves={NOISE_OCTAVES} seed={SPECKLE_SEED} result="speckleNoise" />
          <feColorMatrix in="speckleNoise" type="matrix" values={`${ZERO_ROWS}  ${SPECKLE_ALPHA}`} result="speckle" />
          <feTurbulence type="fractalNoise" baseFrequency={MOTTLE_FREQUENCY} numOctaves={NOISE_OCTAVES} seed={MOTTLE_SEED} result="mottleNoise" />
          <feColorMatrix in="mottleNoise" type="matrix" values={`${ZERO_ROWS}  ${MOTTLE_ALPHA}`} result="mottle" />
          <feComposite in="speckle" in2="mottle" operator="arithmetic" k1="1" result="surface" />
          <feComposite in="SourceGraphic" in2="surface" operator="in" result="worn" />
          <feTurbulence type="fractalNoise" baseFrequency={EDGE_FREQUENCY} numOctaves={NOISE_OCTAVES} seed={EDGE_SEED} result="edgeNoise" />
          <feDisplacementMap in="worn" in2="edgeNoise" scale={EDGE_ROUGHNESS} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <text
        x={SIDE_MARGIN}
        y={BASELINE}
        textLength={VIEW_WIDTH - SIDE_MARGIN * 2}
        lengthAdjust="spacingAndGlyphs"
        fontSize={FONT_SIZE}
        fontWeight="600"
        filter={`url(#${filterId})`}
        className="font-display fill-ultramarine"
      >
        {WORDMARK}
      </text>
    </svg>
  );
};
