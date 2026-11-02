const VISIBLE_RATIO = 0.6;

export const observeVisibility = (element: HTMLElement, onChange: (visible: boolean) => void): (() => void) => {
  const observer = new IntersectionObserver(
    ([entry]) => onChange(entry.intersectionRatio >= VISIBLE_RATIO),
    { threshold: VISIBLE_RATIO },
  );
  observer.observe(element);
  return () => observer.disconnect();
};

export const observeHover = (element: HTMLElement, onChange: (hovered: boolean) => void): (() => void) => {
  const handleEnter = (): void => onChange(true);
  const handleLeave = (): void => onChange(false);
  element.addEventListener("mouseenter", handleEnter);
  element.addEventListener("mouseleave", handleLeave);
  return () => {
    element.removeEventListener("mouseenter", handleEnter);
    element.removeEventListener("mouseleave", handleLeave);
  };
};
