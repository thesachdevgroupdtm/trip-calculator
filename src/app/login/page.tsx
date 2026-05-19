"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleSubmit = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    const { error } =
      mode === "signin" ? await signIn(e, password) : await signUp(e, password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (mode === "signup") {
      toast.success("Account created — you're signed in!");
    }
    router.push("/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="aurora-bg pointer-events-none absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-toyota-red via-red-600 to-red-800 text-2xl font-bold text-white shadow-glow-red">
              GT
            </div>
            <div className="absolute inset-0 -m-2 rounded-full border border-dashed border-toyota-red/40 animate-spin-slow" />
          </motion.div>
          <div className="text-center">
            <h1 className="font-display text-3xl">
              Galaxy <span className="italic text-toyota-red">Toyota</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Trip Calculator</p>
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h2 className="text-xl font-semibold">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Welcome back. Enter your email and password."
              : "Pick an email and password to get started."}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-12 pl-11"
              autoComplete="email"
              autoFocus
              required
              disabled={busy}
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Password"
              className="h-12 pl-11 pr-11"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button
            variant="toyota"
            size="lg"
            onClick={handleSubmit}
            disabled={busy}
            className="w-full"
          >
            {busy ? (
              mode === "signin" ? "Signing in..." : "Creating account..."
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {mode === "signin" ? "Sign in" : "Create account"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
            className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
