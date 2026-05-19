'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { TripProvider } from '@/contexts/TripContext';

export function Providers({ children }: { children: React.ReactNode }) {
  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AuthProvider>
        <TripProvider>{children}</TripProvider>
      </AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EB0A1E', secondary: '#fff' },
          },
        }}
      />
    </NextThemesProvider>
  );
}
