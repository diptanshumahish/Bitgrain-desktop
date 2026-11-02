interface FrameLoop {
  start: () => void;
  stop: () => void;
}

export const createFrameLoop = (onFrame: (time: number) => boolean): FrameLoop => {
  let frameId = 0;
  const tick = (time: number): void => {
    frameId = onFrame(time) ? requestAnimationFrame(tick) : 0;
  };
  return {
    start: () => {
      if (!frameId) frameId = requestAnimationFrame(tick);
    },
    stop: () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    },
  };
};
