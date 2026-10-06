import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { onTutorial } from "../../lib/tutorial-event-bus";
import { TUTORIALS } from "../../data/tutorial-steps";
import type { TutorialStep } from "../../data/tutorial-steps";
import { TutorialTooltip } from "../tutorial/TutorialTooltip";

const TOOLTIP_OFFSET = 14;
const SPOTLIGHT_PADDING = 8;
const TOOLTIP_WIDTH = 288;
const TOOLTIP_HEIGHT_ESTIMATE = 210;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measureTarget(selector: string): TargetRect | null {
  const elements = document.querySelectorAll(selector);
  for (const el of elements) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    }
  }
  return null;
}

function computeTooltipStyle(
  targetRect: TargetRect | null,
  placement: TutorialStep["placement"],
): React.CSSProperties {
  if (!targetRect) {
    return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const spTop = targetRect.top - SPOTLIGHT_PADDING;
  const spLeft = targetRect.left - SPOTLIGHT_PADDING;
  const spWidth = targetRect.width + SPOTLIGHT_PADDING * 2;
  const spHeight = targetRect.height + SPOTLIGHT_PADDING * 2;
  const winH = window.innerHeight;
  const winW = window.innerWidth;

  const clampLeft = (x: number) => Math.min(Math.max(x, 8), winW - TOOLTIP_WIDTH - 8);
  const clampTop = (y: number) => Math.min(Math.max(y, 8), winH - TOOLTIP_HEIGHT_ESTIMATE - 8);
  const centeredLeft = clampLeft(spLeft + spWidth / 2 - TOOLTIP_WIDTH / 2);
  const centeredTop = clampTop(spTop + spHeight / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2);

  const goAbove =
    placement === "top" ||
    (placement !== "bottom" && spTop > winH / 2);

  if (placement === "left") {
    const tooltipRight = winW - spLeft + TOOLTIP_OFFSET;
    if (winW - tooltipRight < TOOLTIP_WIDTH + 8) {
      return { position: "fixed", top: centeredTop, left: spLeft + spWidth + TOOLTIP_OFFSET };
    }
    return { position: "fixed", top: centeredTop, right: tooltipRight };
  }
  if (placement === "right") {
    return { position: "fixed", top: centeredTop, left: spLeft + spWidth + TOOLTIP_OFFSET };
  }
  if (goAbove) {
    return { position: "fixed", bottom: winH - spTop + TOOLTIP_OFFSET, left: centeredLeft };
  }
  return { position: "fixed", top: spTop + spHeight + TOOLTIP_OFFSET, left: centeredLeft };
}

export const TutorialPortal: React.FC = () => {
  const [tutorialId, setTutorialId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => onTutorial((event) => {
    if (event.type === "start") {
      setTutorialId(event.tutorialId);
      setStepIndex(0);
    } else {
      setTutorialId(null);
    }
  }), []);

  const config = tutorialId ? TUTORIALS[tutorialId] : null;
  const currentStep = config?.steps[stepIndex] ?? null;

  useEffect(() => {
    const measure = () => {
      if (!currentStep?.target) {
        setTargetRect(null);
        return;
      }
      setTargetRect(measureTarget(currentStep.target));
    };
    rafRef.current = requestAnimationFrame(measure);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [currentStep]);

  if (!config || !currentStep) return null;

  const handleNext = () => {
    if (stepIndex < config.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => { if (stepIndex > 0) setStepIndex(stepIndex - 1); };

  const handleFinish = () => {
    localStorage.setItem(config.storageKey, "true");
    setTutorialId(null);
  };

  const spottedRect = targetRect
    ? {
        top: targetRect.top - SPOTLIGHT_PADDING,
        left: targetRect.left - SPOTLIGHT_PADDING,
        width: targetRect.width + SPOTLIGHT_PADDING * 2,
        height: targetRect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  const tooltipStyle = computeTooltipStyle(targetRect, currentStep.placement);

  return createPortal(
    <>
      {!spottedRect && (
        <div
          className="fixed inset-0 z-[100]"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={handleNext}
        />
      )}

      {spottedRect && (
        <div
          className="fixed z-[101] rounded-xl pointer-events-none transition-[top,left,width,height] duration-150 ease-out"
          style={{
            top: spottedRect.top,
            left: spottedRect.left,
            width: spottedRect.width,
            height: spottedRect.height,
            boxShadow:
              "0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px rgba(168,158,255,0.85), 0 0 0 6px rgba(168,158,255,0.18)",
          }}
        />
      )}

      <div className="z-[102]" style={tooltipStyle}>
        <TutorialTooltip
          step={currentStep}
          stepIndex={stepIndex}
          totalSteps={config.steps.length}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleFinish}
          isFirst={stepIndex === 0}
          isLast={stepIndex === config.steps.length - 1}
        />
      </div>
    </>,
    document.body,
  );
};
