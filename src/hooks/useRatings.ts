import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_COINS_PER_MINUTE } from "@/constants/economy";

interface Rating {
  id: string;
  call_id: string;
  from_user_id: string;
  to_user_id: string;
  stars: number;
  feedback: string | null;
  created_at: string;
}

interface RatingBreakdown {
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_star: number;
}

interface UserRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: RatingBreakdown;
  currentEarningsRate: number;
  ratingTier: string;
}

export function useRatings(userId?: string) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<UserRatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch ratings received by this user
        const { data: ratingsData, error: ratingsError } = await supabase
          .from("ratings")
          .select("*")
          .eq("to_user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (ratingsError) throw ratingsError;

        setRatings((ratingsData || []) as Rating[]);

        // Fetch user profile for stats
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("rating, total_ratings, rating_breakdown, current_earnings_rate, rating_tier")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          const rawBreakdown = profile.rating_breakdown as Record<string, number> | null;
          const breakdown: RatingBreakdown = {
            five_stars: rawBreakdown?.five_stars ?? 0,
            four_stars: rawBreakdown?.four_stars ?? 0,
            three_stars: rawBreakdown?.three_stars ?? 0,
            two_stars: rawBreakdown?.two_stars ?? 0,
            one_star: rawBreakdown?.one_star ?? 0,
          };

          setStats({
            averageRating: Number(profile.rating) || 0,
            totalRatings: profile.total_ratings || 0,
            ratingBreakdown: breakdown,
            currentEarningsRate: profile.current_earnings_rate || DEFAULT_COINS_PER_MINUTE,
            ratingTier: profile.rating_tier || "standard",
          });
        }
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching ratings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [userId]);

  return { ratings, stats, loading, error };
}

export function useSubmitRating() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitRating = async (callId: string, stars: number, feedback?: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("submit-rating", {
        body: { callId, stars, feedback },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to submit rating");
      }

      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitRating, isSubmitting, error };
}

// Helper function to get tier info
export function getTierInfo(tier: string) {
  const tiers: Record<string, { label: string; icon: string; color: string; bgColor: string; minRating: number; coinsPerMin: number }> = {
    platinum: {
      label: "PLATINUM",
      icon: "👑",
      color: "text-amber-400",
      bgColor: "bg-gradient-to-r from-amber-400/20 to-amber-600/20 border-amber-400/30",
      minRating: 4.8,
      coinsPerMin: 70,
    },
    gold: {
      label: "GOLD",
      icon: "⭐",
      color: "text-yellow-400",
      bgColor: "bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border-yellow-400/30",
      minRating: 4.5,
      coinsPerMin: 62,
    },
    silver: {
      label: "SILVER",
      icon: "🥈",
      color: "text-slate-300",
      bgColor: "bg-gradient-to-r from-slate-300/20 to-slate-500/20 border-slate-300/30",
      minRating: 4.0,
      coinsPerMin: 55,
    },
    bronze: {
      label: "BRONZE",
      icon: "🥉",
      color: "text-amber-600",
      bgColor: "bg-gradient-to-r from-amber-600/20 to-amber-800/20 border-amber-600/30",
      minRating: 3.5,
      coinsPerMin: 50,
    },
    standard: {
      label: "STANDARD",
      icon: "",
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      minRating: 0,
      coinsPerMin: 45,
    },
  };

  return tiers[tier] || tiers.standard;
}

// Calculate progress to next tier
export function getNextTierProgress(currentRating: number, totalRatings: number) {
  const tiers = [
    { name: "platinum", minRating: 4.8, coinsPerMin: 70 },
    { name: "gold", minRating: 4.5, coinsPerMin: 62 },
    { name: "silver", minRating: 4.0, coinsPerMin: 55 },
    { name: "bronze", minRating: 3.5, coinsPerMin: 50 },
    { name: "standard", minRating: 0, coinsPerMin: 45 },
  ];

  // Find current tier and next tier
  let currentTierIndex = tiers.findIndex((t) => currentRating >= t.minRating);
  if (currentTierIndex === -1) currentTierIndex = tiers.length - 1;

  const currentTier = tiers[currentTierIndex];
  const nextTier = currentTierIndex > 0 ? tiers[currentTierIndex - 1] : null;

  if (!nextTier) {
    return {
      nextTier: null,
      progress: 100,
      ratingsNeeded: 0,
      message: "You've reached the highest tier! 🎉",
    };
  }

  // Calculate how many 5-star ratings needed to reach next tier
  const targetRating = nextTier.minRating;
  const totalStars = currentRating * totalRatings;
  
  // Formula: (totalStars + 5*n) / (totalRatings + n) >= targetRating
  // Solving for n: n >= (targetRating * totalRatings - totalStars) / (5 - targetRating)
  const ratingsNeeded = Math.max(
    0,
    Math.ceil((targetRating * totalRatings - totalStars) / (5 - targetRating))
  );

  // Calculate progress percentage
  const prevTierMin = currentTier.minRating;
  const range = targetRating - prevTierMin;
  const progress = range > 0 ? Math.min(100, ((currentRating - prevTierMin) / range) * 100) : 0;

  return {
    nextTier,
    progress,
    ratingsNeeded,
    message: `Need ${ratingsNeeded} more 5-star ratings`,
  };
}
