'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
}

export function useCountUp({
  start = 0,
  end,
  duration = 1200,
  decimals = 0,
}: UseCountUpOptions): number {
  const [value, setValue] = useState(start);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const startVal = value;
    const change = end - startVal;
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + change * eased;
      setValue(
        decimals > 0
          ? Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals)
          : Math.round(current)
      );
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, duration, decimals]);

  return value;
}
