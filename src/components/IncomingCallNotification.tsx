import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEFAULT_COINS_PER_MINUTE } from "@/constants/economy";

interface IncomingCall {
  id: string;
  initiator_id: string;
  callerName: string;
  callerAvatar: string | null;
  callerLanguage: string;
  coinsPerMinute: number;
}

const AUTO_DECLINE_MS = 30000;

export function IncomingCallNotification() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const autoDeclineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!profile || profile.gender !== "female") return;

    const channel = supabase
      .channel(`incoming-calls-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "calls",
          filter: `receiver_id=eq.${profile.id}`,
        },
        async (payload) => {
          const call = payload.new as {
            id: string;
            initiator_id: string;
            status: string;
            coins_per_minute: number;
          };

          if (call.status !== "pending") return;

          // Fetch caller info
          const { data: caller } = await supabase
            .from("profiles")
            .select("name, avatar_url, language")
            .eq("id", call.initiator_id)
            .single();

          setIncomingCall({
            id: call.id,
            initiator_id: call.initiator_id,
            callerName: caller?.name || "Someone",
            callerAvatar: caller?.avatar_url || null,
            callerLanguage: caller?.language || "en",
            coinsPerMinute: call.coins_per_minute || DEFAULT_COINS_PER_MINUTE,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  // Auto-decline after 30s
  useEffect(() => {
    if (incomingCall) {
      autoDeclineTimer.current = setTimeout(() => {
        handleDecline();
      }, AUTO_DECLINE_MS);
    }

    return () => {
      if (autoDeclineTimer.current) clearTimeout(autoDeclineTimer.current);
    };
  }, [incomingCall]);

  // Also listen for the call being cancelled/ended by the caller
  useEffect(() => {
    if (!incomingCall) return;

    const channel = supabase
      .channel(`call-status-${incomingCall.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "calls",
          filter: `id=eq.${incomingCall.id}`,
        },
        (payload) => {
          const updated = payload.new as { status: string };
          if (updated.status !== "pending") {
            setIncomingCall(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [incomingCall]);

  const handleAccept = async () => {
    if (!incomingCall) return;
    setIsAccepting(true);

    try {
      const { data, error } = await supabase.functions.invoke("join-call", {
        body: { callId: incomingCall.id },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setIncomingCall(null);
        return;
      }

      const callInfo = {
        callId: incomingCall.id,
        token: data.token,
        roomName: data.roomName,
        coinsPerMinute: incomingCall.coinsPerMinute,
        receiver: {
          id: incomingCall.initiator_id,
          name: incomingCall.callerName,
          avatar_url: incomingCall.callerAvatar,
          language: incomingCall.callerLanguage,
        },
      };

      setIncomingCall(null);
      navigate(`/call/${incomingCall.id}`, { state: { callInfo } });
    } catch (err) {
      console.error("Accept call error:", err);
      toast.error("Failed to join call.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!incomingCall) return;
    setIsDeclining(true);

    try {
      await supabase.functions.invoke("decline-call", {
        body: { callId: incomingCall.id },
      });
    } catch (err) {
      console.error("Decline call error:", err);
    } finally {
      setIncomingCall(null);
      setIsDeclining(false);
    }
  };

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden"
          >
            {/* Gradient top */}
            <div className="gradient-primary p-8 text-center relative overflow-hidden">
              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-32 h-32 rounded-full border-2 border-white/30" />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <div className="w-32 h-32 rounded-full border-2 border-white/20" />
              </motion.div>

              <div className="relative z-10">
                <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden mx-auto mb-4">
                  {incomingCall.callerAvatar ? (
                    <img src={incomingCall.callerAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-white/80 text-sm mb-1">Incoming Video Call</p>
                <h2 className="text-white font-display text-2xl font-bold">
                  {incomingCall.callerName}
                </h2>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 flex items-center justify-center gap-8">
              <div className="text-center">
                <button
                  onClick={handleDecline}
                  disabled={isDeclining}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors mb-2"
                >
                  {isDeclining ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <PhoneOff className="w-6 h-6 text-white" />
                  )}
                </button>
                <span className="text-xs text-muted-foreground">Decline</span>
              </div>

              <div className="text-center">
                <motion.button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors mb-2"
                >
                  {isAccepting ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Phone className="w-6 h-6 text-white" />
                  )}
                </motion.button>
                <span className="text-xs text-muted-foreground">Accept</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
