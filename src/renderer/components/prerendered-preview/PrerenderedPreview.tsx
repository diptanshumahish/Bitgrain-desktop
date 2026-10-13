import React, { useEffect, useRef, useState } from "react";
import { peekPrerender, prerender, type PrerenderSpec } from "./prerender-cache";
import { isLowEndDevice } from "../../lib/device-capability";

const VIEWPORT_PREP_MARGIN = "200px";
const IDLE_TIMEOUT_MS = 1500;

let lowEndCache: boolean | null = null;
const isLowEnd = (): boolean => {
  if (lowEndCache === null) lowEndCache = isLowEndDevice();
  return lowEndCache;
};

const requestIdle = (cb: () => void): void => {
  const win = window as Window & {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout: number }) => number;
  };
  if (win.requestIdleCallback) {
    win.requestIdleCallback(() => cb(), { timeout: IDLE_TIMEOUT_MS });
    return;
  }
  setTimeout(cb, 32);
};

interface PrerenderedPreviewProps extends PrerenderSpec {
  className?: string;
  alt?: string;
  fallbackToSource?: boolean;
  staggerDelayMs?: number;
}

export const PrerenderedPreview: React.FC<PrerenderedPreviewProps> = ({
  className,
  alt = "",
  fallbackToSource = true,
  staggerDelayMs = 0,
  ...spec
}) => {
  const skipHeavyRender = isLowEnd();
  const [src, setSrc] = useState<string>(() => peekPrerender(spec) ?? "");
  const [visible, setVisible] = useState<boolean>(() => !!peekPrerender(spec));
  const rootRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (src) return;
    if (skipHeavyRender) return;
    const cached = peekPrerender(spec);
    if (cached) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSrc(cached);
      setVisible(true);
      return;
    }

    cancelledRef.current = false;
    const node = rootRef.current;
    if (!node) return;

    let timer: number | null = null;
    const start = () => {
      timer = window.setTimeout(() => {
        requestIdle(() => {
          if (cancelledRef.current) return;
          prerender(spec).then((url) => {
            if (!cancelledRef.current && url) {
              setSrc(url);
              setVisible(true);
            }
          });
        });
      }, staggerDelayMs);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            start();
            break;
          }
        }
      },
      { rootMargin: VIEWPORT_PREP_MARGIN },
    );
    observer.observe(node);

    return () => {
      cancelledRef.current = true;
      observer.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
    // spec captured into prerender cache by value; primitive equality covers param changes the parent re-mounts on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.image, staggerDelayMs]);

  return (
    <div ref={rootRef} className={className}>
      {src ? (
        <img
          src={src}
          alt={alt}
          decoding="async"
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
        />
      ) : fallbackToSource ? (
        <img
          src={spec.image}
          alt={alt}
          decoding="async"
          loading="lazy"
          className={`w-full h-full object-cover ${skipHeavyRender ? "opacity-100" : "opacity-60"}`}
        />
      ) : null}
    </div>
  );
};
