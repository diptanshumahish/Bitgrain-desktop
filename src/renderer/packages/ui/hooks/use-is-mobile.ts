import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

const matchMobile = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(MOBILE_QUERY).matches;
};

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(matchMobile);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent): void => setIsMobile(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
};

export const isMobileNow = matchMobile;
