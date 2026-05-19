'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Fingerprint } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/useMounted';
import toast from 'react-hot-toast';

const PASSCODE_LENGTH = 4;

export default function LoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const login = useTripStore((s) => s.login);
  const isAuthenticated = useTripStore((s) => s.isAuthenticated);
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, mounted, router]);

  const handleDigit = (digit: string) => {
    if (passcode.length >= PASSCODE_LENGTH) return;
    const next = passcode + digit;
    setPasscode(next);

    if (next.length === PASSCODE_LENGTH) {
      setTimeout(() => {
        if (login(next)) {
          toast.success('Welcome aboard!');
          router.replace('/dashboard');
        } else {
          setError(true);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(50);
          }
          setTimeout(() => {
            setPasscode('');
            setError(false);
          }, 500);
        }
      }, 200);
    }
  };

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1));
  };

  if (!mounted) return null;

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 safe-top safe-bottom relative overflow-hidden">
      {/* Aurora background blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-toyota-red/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-galaxy-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <div className="relative mb-8 mx-auto w-20 h-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
            />
            <div className="absolute inset-2 rounded-full toyota-gradient flex items-center justify-center shadow-glow-red">
              <span className="font-display text-3xl text-white tracking-tight">
                GT
              </span>
            </div>
          </div>

          <h1 className="font-display text-3xl mb-1 tracking-tight">
            Galaxy <span className="text-gradient-toyota italic">Toyota</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Trip Calculator · Enter passcode
          </p>
        </motion.div>

        {/* Passcode dots */}
        <motion.div
          animate={error ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-12"
        >
          {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => {
            const filled = i < passcode.length;
            return (
              <motion.div
                key={i}
                animate={{
                  scale: filled ? 1.1 : 1,
                }}
                className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 transition-all duration-200',
                  error
                    ? 'border-destructive bg-destructive'
                    : filled
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 bg-transparent'
                )}
              />
            );
          })}
        </motion.div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {keys.map((key, i) => {
            if (key === '') return <div key={i} />;
            if (key === 'del') {
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  disabled={passcode.length === 0}
                  className="aspect-square rounded-2xl flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30"
                  aria-label="Delete"
                >
                  <Delete className="w-6 h-6" />
                </motion.button>
              );
            }
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleDigit(key)}
                className="aspect-square rounded-2xl text-2xl font-light bg-card/40 backdrop-blur hover:bg-accent transition-all border border-border/40 hover:border-primary/30 shadow-soft"
              >
                {key}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-sm text-destructive font-medium"
            >
              Incorrect passcode
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[11px] text-muted-foreground mb-2 text-center"
      >
        Default passcode: <span className="font-mono font-medium">1234</span> · change in Settings
      </motion.p>
    </div>
  );
}
