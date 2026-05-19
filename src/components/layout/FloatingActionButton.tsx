'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabProps {
  href: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FloatingActionButton({ href, label, icon, className }: FabProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'fixed bottom-20 right-4 z-40',
        'mx-auto max-w-md',
        className
      )}
      style={{ left: 'min(100vw, 28rem) - 4.5rem' as any }}
    >
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2 h-14 px-5 rounded-2xl',
          'toyota-gradient text-white shadow-glow-red',
          'transition-transform active:scale-95',
          'font-semibold text-sm'
        )}
      >
        {icon ?? <Plus className="w-5 h-5" strokeWidth={2.5} />}
        {label && <span>{label}</span>}
      </Link>
    </motion.div>
  );
}
