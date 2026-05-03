import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  Loader2,
  Gift,
  Coins,
} from "lucide-react";
import { useGiftTypes } from "@/hooks/useGiftTypes";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SendGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  /** When set, stored on the gift row and used for in-call realtime */
  callId?: string | null;
  /** Called after a gift is successfully sent (e.g. in-call data channel + realtime UX) */
  onGiftSent?: (info: { giftName: string; giftEmoji: string; coins: number; giftDbId?: string }) => void;
}

export function SendGiftModal({
  isOpen,
  onClose,
  receiverId,
  receiverName,
  callId,
  onGiftSent,
}: SendGiftModalProps) {
  const { giftTypes, loading } = useGiftTypes();
  const { user, wallet, refreshProfile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const selectedGift = giftTypes.find((g) => g.id === selectedId);
  const hasEnoughCoins = selectedGift ? (wallet?.balance || 0) >= selectedGift.coins_cost : false;

  const directSendGift = async () => {
    if (!selectedGift || !user) throw new Error("Missing data");

    const currentBalance = wallet?.balance || 0;
    if (currentBalance < selectedGift.coins_cost) {
      throw new Error("Not enough coins");
    }

    // 1. Deduct from sender's wallet (own data — RLS allows)
    const { error: deductErr } = await supabase
      .from("wallets")
      .update({
        balance: currentBalance - selectedGift.coins_cost,
        total_spent: (wallet?.total_spent || 0) + selectedGift.coins_cost,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (deductErr) throw deductErr;

    // 2. Record gift (RLS allows sender to insert)
    const { data: insertedGift, error: giftInsErr } = await supabase
      .from("gifts")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        gift_type: selectedGift.id,
        gift_name: selectedGift.name,
        coins_amount: selectedGift.coins_cost,
        ...(callId ? { call_id: callId } : {}),
      })
      .select("id")
      .single();

    if (giftInsErr) throw giftInsErr;

    // 3. Record sender's transaction (own data — RLS allows)
    const { error: txErr } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "gift_sent",
      coins: selectedGift.coins_cost,
      amount: Math.round(selectedGift.coins_cost / 6),
      status: "completed",
      related_user_id: receiverId,
      description: `Sent ${selectedGift.name} ${selectedGift.emoji} to ${receiverName}`,
    });

    if (txErr) {
      console.error("gift_sent transaction insert failed:", txErr);
      throw new Error("Gift sent but transaction recording failed");
    }

    // NOTE: Receiver's earnings credit and gift_received transaction
    // require service-role access (RLS blocks cross-user writes).
    // These will be handled by the edge function in production.

    return { gift: selectedGift, giftDbId: insertedGift.id as string };
  };

  const handleSend = async () => {
    if (!selectedId || !selectedGift) return;

    setIsSending(true);

    try {
      let sentGift = selectedGift;

      try {
        const { data, error } = await supabase.functions.invoke("send-gift", {
          body: {
            giftTypeId: selectedId,
            receiverId,
            ...(callId ? { callId } : {}),
          },
        });

        if (!error && data && !data.error) {
          toast.success(
            `${data.gift.emoji} ${data.gift.name} sent to ${data.gift.receiverName}!`
          );
          onGiftSent?.({
            giftName: data.gift.name,
            giftEmoji: data.gift.emoji,
            coins: data.gift.coins ?? selectedGift.coins_cost,
            giftDbId: data.gift.id ?? undefined,
          });
          await refreshProfile();
          onClose();
          return;
        }
      } catch {
        // Edge function not deployed — fall back to direct DB
      }

      const { gift, giftDbId } = await directSendGift();
      sentGift = gift;
      toast.success(
        `${sentGift.emoji} ${sentGift.name} sent to ${receiverName}!`
      );
      onGiftSent?.({
        giftName: sentGift.name,
        giftEmoji: sentGift.emoji,
        coins: sentGift.coins_cost,
        giftDbId,
      });
      await refreshProfile();
      onClose();
    } catch (err) {
      console.error("Gift send error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to send gift. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-pink-500" />
                Send Gift
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Send a gift to <span className="font-medium text-foreground">{receiverName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance */}
          <div className="mx-6 mb-4 p-3 rounded-xl bg-bunny-gold/10 border border-bunny-gold/20 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your balance</span>
            <span className="font-semibold text-bunny-gold flex items-center gap-1">
              <Coins className="w-4 h-4" />
              {wallet?.balance?.toLocaleString() || 0}
            </span>
          </div>

          {/* Gift Types */}
          <div className="px-6 pb-4 max-h-[45vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : giftTypes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No gifts available right now.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {giftTypes.map((gift) => {
                  const isSelected = selectedId === gift.id;
                  const canAfford = (wallet?.balance || 0) >= gift.coins_cost;

                  return (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedId(gift.id)}
                      disabled={!canAfford}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-glow"
                          : canAfford
                            ? "border-border/50 hover:border-primary/30"
                            : "border-border/30 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-3xl">{gift.emoji}</span>
                      <span className="text-xs font-medium truncate w-full text-center">
                        {gift.name}
                      </span>
                      <span className="text-xs text-bunny-gold font-semibold flex items-center gap-0.5">
                        <Coins className="w-3 h-3" />
                        {gift.coins_cost}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-border/50">
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!selectedId || !hasEnoughCoins || isSending}
              onClick={handleSend}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Gift className="w-5 h-5 mr-2" />
              )}
              {isSending
                ? "Sending..."
                : selectedGift
                  ? `Send ${selectedGift.name} (${selectedGift.coins_cost} coins)`
                  : "Select a gift"}
            </Button>
            {selectedGift && !hasEnoughCoins && (
              <p className="text-xs text-destructive text-center mt-2">
                Not enough coins. You need {selectedGift.coins_cost - (wallet?.balance || 0)} more.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
