import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price_inr: number;
  bonus_percent: number;
  is_popular: boolean;
}

export function useCoinPackages() {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from("coin_packages")
          .select("*")
          .eq("is_active", true)
          .order("price_inr", { ascending: true });

        if (queryError) {
          throw queryError;
        }

        setPackages((data || []) as CoinPackage[]);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching coin packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return { packages, loading, error };
}
