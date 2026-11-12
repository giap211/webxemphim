"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight liquid-style dock decoration without WebGL or refraction.
 * Keeps the frosted-glass backing and the animated active-item highlight.
 */
export function LiquidGlassDockSurface() {
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bubble = bubbleRef.current;
    const dock = bubble?.parentElement;
    if (!bubble || !dock) return;

    const placeBubble = () => {
      const active = dock.querySelector<HTMLElement>(".dock-item.active");
      if (!active) {
        bubble.style.opacity = "0";
        return;
      }
      const dockRect = dock.getBoundingClientRect();
      const itemRect = active.getBoundingClientRect();
      bubble.style.opacity = "1";
      bubble.style.left = itemRect.left - dockRect.left + 4 + "px";
      bubble.style.width = Math.max(0, itemRect.width - 8) + "px";
    };

    const mutationObserver = new MutationObserver(placeBubble);
    mutationObserver.observe(dock, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    const resizeObserver = new ResizeObserver(placeBubble);
    resizeObserver.observe(dock);
    window.addEventListener("resize", placeBubble);
    placeBubble();

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", placeBubble);
    };
  }, []);

  return (
    <>
      <div className="gt-liquid-glass-blur" aria-hidden="true" />
      <div
        ref={bubbleRef}
        className="gt-liquid-glass-bubble"
        aria-hidden="true"
      />
    </>
  );
}
