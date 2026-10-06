import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_TRANSITION_EVENT } from "./page-transition-events";
import type { PageTransitionDetail } from "./page-transition-events";

const EXPAND_MS = 420;
const REVEAL_MS = 280;
const START_RADIUS = 16;
const SAFETY_MS = EXPAND_MS + REVEAL_MS + 600;
const EXPAND_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const readVar = (el: HTMLElement, name: string): string =>
  getComputedStyle(el).getPropertyValue(name).trim();

export const PageTransitionPortal: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const activeRef = useRef(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    let safetyId = 0;
    let navigateId = 0;
    let target = "";

    const finish = (): void => {
      window.clearTimeout(safetyId);
      window.clearTimeout(navigateId);
      overlay.style.transition = "none";
      overlay.style.opacity = "0";
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      activeRef.current = false;
    };

    const reveal = (): void => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.transition = `opacity ${REVEAL_MS}ms ease-out`;
          overlay.style.opacity = "0";
        });
      });
    };

    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === overlay && event.propertyName === "opacity") finish();
    };

    const start = (event: Event): void => {
      const detail = (event as CustomEvent<PageTransitionDetail>).detail;
      if (!detail || activeRef.current) return;
      activeRef.current = true;
      target = detail.to;
      const { rect } = detail;
      const panel = readVar(overlay, "--s-bg-panel") || "#14151C";
      const canvas = readVar(overlay, "--s-bg-canvas") || "#0B0B11";

      overlay.style.display = "block";
      overlay.style.pointerEvents = "auto";
      overlay.style.transition = "none";
      overlay.style.opacity = "1";
      overlay.style.borderRadius = `${START_RADIUS}px`;
      overlay.style.background = panel;
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;

      void overlay.offsetWidth;

      const props = ["top", "left", "width", "height", "border-radius", "background"];
      overlay.style.transition = props
        .map((prop) => `${prop} ${EXPAND_MS}ms ${EXPAND_EASE}`)
        .join(", ");
      overlay.style.top = "0px";
      overlay.style.left = "0px";
      overlay.style.width = `${window.innerWidth}px`;
      overlay.style.height = `${window.innerHeight}px`;
      overlay.style.borderRadius = "0px";
      overlay.style.background = canvas;

      window.clearTimeout(safetyId);
      window.clearTimeout(navigateId);
      safetyId = window.setTimeout(finish, SAFETY_MS);
      navigateId = window.setTimeout(() => {
        navigate(target);
        reveal();
      }, EXPAND_MS);
    };

    overlay.addEventListener("transitionend", onTransitionEnd);
    window.addEventListener(PAGE_TRANSITION_EVENT, start);
    return () => {
      overlay.removeEventListener("transitionend", onTransitionEnd);
      window.removeEventListener(PAGE_TRANSITION_EVENT, start);
      window.clearTimeout(safetyId);
      window.clearTimeout(navigateId);
    };
  }, [navigate]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed z-[200] overflow-hidden"
      style={{ display: "none" }}
    />
  );
};
