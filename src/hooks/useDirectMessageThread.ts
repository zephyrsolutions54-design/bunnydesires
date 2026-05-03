import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function threadKeyFor(userA: string, userB: string): string {
  return [userA, userB].sort().join("_");
}

export interface DirectMessageRow {
  id: string;
  thread_key: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
}

export function useDirectMessageThread(partnerId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const threadKey = useMemo(() => {
    if (!user || !partnerId) return null;
    return threadKeyFor(user.id, partnerId);
  }, [user, partnerId]);

  const fetchMessages = useCallback(async () => {
    if (!threadKey) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("thread_key", threadKey)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      console.error("direct_messages fetch:", error);
      setMessages([]);
    } else {
      setMessages((data || []) as DirectMessageRow[]);
    }
    setLoading(false);
  }, [threadKey]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!threadKey || !user) return;

    const channel = supabase
      .channel(`dm-${threadKey}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `thread_key=eq.${threadKey}`,
        },
        (payload) => {
          const row = payload.new as DirectMessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadKey, user]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!user || !partnerId || !threadKey || !body.trim()) return { error: new Error("Invalid") };

      const { error } = await supabase.from("direct_messages").insert({
        thread_key: threadKey,
        sender_id: user.id,
        recipient_id: partnerId,
        body: body.trim(),
      });

      return { error: error as Error | null };
    },
    [user, partnerId, threadKey]
  );

  return { messages, loading, sendMessage, refresh: fetchMessages };
}

export interface ThreadPreview {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastBody: string;
  lastAt: string;
}

export function useMessageThreadList() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ThreadPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setThreads([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("direct_messages")
        .select("sender_id, recipient_id, body, created_at")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(300);

      if (error || !data) {
        setThreads([]);
        setLoading(false);
        return;
      }

      const seen = new Set<string>();
      const previews: ThreadPreview[] = [];

      for (const row of data) {
        const partnerId = row.sender_id === user.id ? row.recipient_id : row.sender_id;
        if (seen.has(partnerId)) continue;
        seen.add(partnerId);

        const { data: prof } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", partnerId)
          .single();

        previews.push({
          partnerId,
          partnerName: prof?.name || "User",
          partnerAvatar: prof?.avatar_url || null,
          lastBody: row.body,
          lastAt: row.created_at,
        });
      }

      setThreads(previews);
      setLoading(false);
    };

    load();
  }, [user]);

  return { threads, loading };
}
