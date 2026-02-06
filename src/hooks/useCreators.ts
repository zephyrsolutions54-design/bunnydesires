import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type RatingTier = "platinum" | "gold" | "silver" | "bronze" | "standard";

interface Creator {
  id: string;
  name: string;
  gender: "male" | "female";
  avatar_url: string | null;
  bio: string | null;
  country: string;
  language: string;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_ratings: number;
  rating_tier: RatingTier;
  current_earnings_rate: number;
}

interface UseCreatorsOptions {
  country?: string;
  onlineOnly?: boolean;
  searchQuery?: string;
}

export function useCreators(options: UseCreatorsOptions = {}) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { country, onlineOnly, searchQuery } = options;

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from("profiles")
          .select("id, name, gender, avatar_url, bio, country, language, is_online, is_verified, rating, total_ratings, rating_tier, current_earnings_rate")
          .eq("gender", "female")
          .order("is_online", { ascending: false })
          .order("rating", { ascending: false });

        if (country && country !== "All Countries") {
          query = query.eq("country", country);
        }

        if (onlineOnly) {
          query = query.eq("is_online", true);
        }

        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        setCreators((data || []) as Creator[]);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching creators:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [country, onlineOnly, searchQuery]);

  return { creators, loading, error };
}
