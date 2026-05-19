'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Wallet, Receipt, PieChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/collection', label: 'Collect', icon: Wallet },
  { href: '/expense', label: 'Spend', icon: Receipt },
  { href: '/analytics', label: 'Stats', icon: PieChart },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <nav className="bottom-nav">
      <div className="relative flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                'flex-1 h-full tap-target',
                'transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
