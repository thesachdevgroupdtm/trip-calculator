'use client';

import Link from 'next/link';
import { ChevronLeft, Bell } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  back?: string;
  showTheme?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  title,
  subtitle,
  back,
  showTheme = true,
  rightSlot,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 safe-top',
        'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
        'border-b border-border/40',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {back && (
            <Link
              href={back}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-accent transition-colors tap-target"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-base font-semibold tracking-tight truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate -mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {rightSlot}
          {showTheme && <ThemeToggle />}
        </div>
      </div>
    </header>
  );
}
