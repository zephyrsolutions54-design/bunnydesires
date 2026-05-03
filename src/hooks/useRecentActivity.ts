import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RecentCall {
  id: string;
  initiator_id: string;
  receiver_id: string;
  status: string;
  start_time: string | null;
  end_time: string | null;
  duration_seconds: number;
  coins_spent: number;
  coins_per_minute: number;
  created_at: string;
  caller_name: string;
  caller_avatar: string | null;
}

interface RecentGift {
  id: string;
  sender_id: string;
  gift_type: string;
  gift_name: string;
  coins_amount: number;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  amount_inr: number;
  status: string;
  payment_method: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

export type ActivityItem =
  | { type: "call"; data: RecentCall; timestamp: string }
  | { type: "gift"; data: RecentGift; timestamp: string };

export function useRecentActivity() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchActivity = async () => {
      setLoading(true);

      const [callsRes, giftsRes, withdrawalsRes] = await Promise.all([
        supabase
          .from("calls")
          .select("id, initiator_id, receiver_id, status, start_time, end_time, duration_seconds, coins_spent, coins_per_minute, created_at")
          .eq("receiver_id", user.id)
          .in("status", ["ended", "active", "declined", "missed"])
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("gifts")
          .select("id, sender_id, gift_type, gift_name, coins_amount, created_at")
          .eq("receiver_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("withdrawals")
          .select("id, amount, amount_inr, status, payment_method, requested_at, processed_at, notes")
          .eq("user_id", user.id)
          .order("requested_at", { ascending: false })
          .limit(20),
      ]);

      if (withdrawalsRes.data) {
        setWithdrawals(withdrawalsRes.data as WithdrawalRecord[]);
      }

      const callerIds = new Set<string>();
      (callsRes.data || []).forEach((c) => callerIds.add(c.initiator_id));
      (giftsRes.data || []).forEach((g) => callerIds.add(g.sender_id));

      let profileMap: Record<string, { name: string; avatar_url: string | null }> = {};
      if (callerIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", Array.from(callerIds));
        (profiles || []).forEach((p) => {
          profileMap[p.id] = { name: p.name, avatar_url: p.avatar_url };
        });
      }

      const items: ActivityItem[] = [];

      (callsRes.data || []).forEach((c) => {
        const prof = profileMap[c.initiator_id];
        items.push({
          type: "call",
          timestamp: c.created_at,
          data: {
            ...c,
            caller_name: prof?.name || "Unknown",
            caller_avatar: prof?.avatar_url || null,
          } as RecentCall,
        });
      });

      (giftsRes.data || []).forEach((g) => {
        const prof = profileMap[g.sender_id];
        items.push({
          type: "gift",
          timestamp: g.created_at,
          data: {
            ...g,
            sender_name: prof?.name || "Unknown",
            sender_avatar: prof?.avatar_url || null,
          } as RecentGift,
        });
      });

      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivity(items);
      setLoading(false);
    };

    fetchActivity();
  }, [user]);

  return { activity, withdrawals, loading };
}

export function useTransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("transactions")
        .select("id, type, amount, coins, description, status, created_at, related_user_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
        return;
      }

      const relatedIds = new Set<string>();
      (data || []).forEach((t) => {
        if (t.related_user_id) relatedIds.add(t.related_user_id);
      });

      let profileMap: Record<string, string> = {};
      if (relatedIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", Array.from(relatedIds));
        (profiles || []).forEach((p) => {
          profileMap[p.id] = p.name;
        });
      }

      setTransactions(
        (data || []).map((t) => ({
          ...t,
          related_user_name: t.related_user_id ? profileMap[t.related_user_id] || null : null,
        })) as TransactionRecord[]
      );
      setLoading(false);
    };

    fetchTransactions();
  }, [user]);

  return { transactions, loading };
}

export interface TransactionRecord {
  id: string;
  type: string;
  amount: number;
  coins: number;
  description: string | null;
  status: string;
  created_at: string;
  related_user_id: string | null;
  related_user_name: string | null;
}
