import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GiftType {
  id: string;
  name: string;
  emoji: string;
  coins_cost: number;
}

export function useGiftTypes() {
  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGiftTypes = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from("gift_types")
          .select("*")
          .eq("is_active", true)
          .order("coins_cost", { ascending: true });

        if (queryError) {
          throw queryError;
        }

        setGiftTypes((data || []) as GiftType[]);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching gift types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGiftTypes();
  }, []);

  return { giftTypes, loading, error };
}
