"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTrip } from "@/contexts/TripContext";

export function TripGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { activeTripId, trip, loading: tripLoading } = useTrip();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Wait for trip data to finish loading before deciding to bounce —
    // setActiveTrip sets activeTripId and loads in one async step.
    if (tripLoading) return;
    if (!activeTripId) {
      router.replace("/trips");
    }
  }, [authLoading, user, tripLoading, activeTripId, router]);

  if (authLoading || !user || !activeTripId || tripLoading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
