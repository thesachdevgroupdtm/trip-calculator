'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  threshold?: number;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
}: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const indicatorOpacity = useTransform(pullY, [0, threshold], [0, 1]);
  const indicatorRotate = useTransform(pullY, [0, threshold], [0, 360]);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      const eased = Math.min(dy * 0.5, threshold * 1.5);
      pullY.set(eased);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pullY.get() >= threshold) {
      setRefreshing(true);
      await animate(pullY, threshold * 0.6, { duration: 0.2 });
      try {
        await onRefresh();
      } finally {
        await animate(pullY, 0, { duration: 0.3 });
        setRefreshing(false);
      }
    } else {
      animate(pullY, 0, { duration: 0.25 });
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <motion.div
        style={{ opacity: indicatorOpacity, y: pullY }}
        className="absolute top-0 left-0 right-0 flex justify-center pt-3 pointer-events-none z-10"
      >
        <motion.div
          style={{ rotate: refreshing ? undefined : indicatorRotate }}
          animate={refreshing ? { rotate: 360 } : {}}
          transition={
            refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}
          }
          className="w-9 h-9 rounded-full glass-strong flex items-center justify-center shadow-soft"
        >
          <Loader2 className="w-4 h-4 text-primary" />
        </motion.div>
      </motion.div>
      <motion.div style={{ y: pullY }}>{children}</motion.div>
    </div>
  );
}
