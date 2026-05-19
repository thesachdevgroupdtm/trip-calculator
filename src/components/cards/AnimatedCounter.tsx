'use client';

import { useCountUp } from '@/hooks/useCountUp';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  format?: 'currency' | 'number';
  duration?: number;
  className?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  format = 'number',
  duration = 1200,
  className,
  prefix,
}: AnimatedCounterProps) {
  const animated = useCountUp({ end: value, duration });

  const display =
    format === 'currency' ? formatCurrency(animated) : animated.toLocaleString('en-IN');

  return (
    <span className={cn('number-display tabular-nums', className)}>
      {prefix}
      {display}
    </span>
  );
}
