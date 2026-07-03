"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value from 0 (or its previous value) up to `value` on change,
 * using an eased requestAnimationFrame loop — no animation library required.
 */
export function useCountUp(value: number, durationMs = 800) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number.isFinite(value) ? value : 0;
    const start = performance.now();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}
