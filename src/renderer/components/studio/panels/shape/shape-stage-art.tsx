import React from "react";

const ORBIT_RADII = [44, 32];
const SATELLITE_ANGLE_RAD = -Math.PI / 4;
const STAGE_CENTER = 54;

export const ShapeStageArt: React.FC = () => {
  const outer = ORBIT_RADII[0];
  const satelliteX = STAGE_CENTER + outer * Math.cos(SATELLITE_ANGLE_RAD);
  const satelliteY = STAGE_CENTER + outer * Math.sin(SATELLITE_ANGLE_RAD);

  return (
    <svg viewBox="0 0 108 108" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <g fill="none" className="stroke-current" strokeWidth="0.8" opacity="0.55">
        {ORBIT_RADII.map((radius) => (
          <circle key={radius} cx={STAGE_CENTER} cy={STAGE_CENTER} r={radius} strokeDasharray={radius === outer ? "2 3" : undefined} />
        ))}
        <path d={`M${STAGE_CENTER} 4 V14 M${STAGE_CENTER} 94 V104 M4 ${STAGE_CENTER} H14 M94 ${STAGE_CENTER} H104`} />
      </g>
      <circle cx={satelliteX} cy={satelliteY} r="2.6" className="fill-current" opacity="0.8" />
    </svg>
  );
};
