'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTripStore } from '@/store/useTripStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const hasHydrated = useTripStore((s) => s.hasHydrated);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, hasHydrated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
