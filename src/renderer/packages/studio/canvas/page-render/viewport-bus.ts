type ViewportListener = () => void;

const listeners = new Set<ViewportListener>();

export const announceViewportChange = (): void => {
  listeners.forEach((listener) => listener());
};

export const onViewportChange = (listener: ViewportListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
