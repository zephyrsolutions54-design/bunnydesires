import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  Sparkles,
  Crown,
  Zap,
  Gift,
  Check,
  Loader2,
  Coins,
} from "lucide-react";
import { useCoinPackages } from "@/hooks/useCoinPackages";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (opts: {
        paymentSessionId: string;
        redirectTarget?: string;
      }) => Promise<{ error?: { message: string }; paymentDetails?: { paymentMessage: string } }>;
    };
  }
}

interface BuyCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const packageIcons = [Zap, Gift, Sparkles, Crown];

const formatNumber = (num: number) => num.toLocaleString("en-IN");

function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("cashfree-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "cashfree-sdk";
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function BuyCoinsModal({ isOpen, onClose }: BuyCoinsModalProps) {
  const { packages, loading } = useCoinPackages();
  const { user, refreshProfile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const directPurchase = useCallback(
    async (packageId: string) => {
      if (!user) throw new Error("Not authenticated");

      const pkg = packages.find((p) => p.id === packageId);
      if (!pkg) throw new Error("Package not found");

      const { data: wallet, error: walletErr } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (walletErr || !wallet) throw new Error("Wallet not found");

      const { error: updateErr } = await supabase
        .from("wallets")
        .update({
          balance: wallet.balance + pkg.coins,
          total_purchased: wallet.total_purchased + pkg.coins,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateErr) throw updateErr;

      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "coin_purchase",
        coins: pkg.coins,
        amount: pkg.price_inr,
        status: "completed",
        description: `Purchased ${pkg.name} — ${pkg.coins} coins`,
      });

      toast.success(`${formatNumber(pkg.coins)} coins added to your wallet!`);
      await refreshProfile();
      onClose();
    },
    [user, packages, refreshProfile, onClose]
  );

  const completePurchaseViaEdge = useCallback(
    async (packageId: string, cashfreeOrderId?: string) => {
      const { data, error } = await supabase.functions.invoke("purchase-coins", {
        body: {
          packageId,
          cashfreeOrderId: cashfreeOrderId || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${formatNumber(data.coinsAdded)} coins added to your wallet!`);
      await refreshProfile();
      onClose();
    },
    [refreshProfile, onClose]
  );

  const handlePurchase = async () => {
    if (!selectedId) return;

    setIsPurchasing(true);

    try {
      // Try to create a Cashfree order via edge function
      let orderData: Record<string, unknown> | null = null;
      let edgeFunctionsAvailable = true;

      try {
        const res = await supabase.functions.invoke("create-payment-order", {
          body: { packageId: selectedId },
        });
        if (!res.error && res.data && !res.data.error) {
          orderData = res.data;
        } else if (res.data?.error === "Payment gateway not configured") {
          await completePurchaseViaEdge(selectedId);
          return;
        }
      } catch {
        edgeFunctionsAvailable = false;
      }

      if (!edgeFunctionsAvailable) {
        await directPurchase(selectedId);
        return;
      }

      if (!orderData) {
        try {
          await completePurchaseViaEdge(selectedId);
        } catch {
          await directPurchase(selectedId);
        }
        return;
      }

      // Load Cashfree SDK and open checkout
      const loaded = await loadCashfreeScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        return;
      }

      const sessionId = orderData.paymentSessionId as string | undefined;
      if (!sessionId) {
        console.error("Missing paymentSessionId from create-payment-order:", orderData);
        toast.error("Could not start checkout. Check Cashfree order API response.");
        return;
      }

      const cfMode = (orderData.env as string) === "sandbox" ? "sandbox" : "production";
      const cashfree = window.Cashfree({ mode: cfMode });

      const result = await cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      });

      if (result.error) {
        const err = result.error as { message?: string; code?: string; type?: string };
        const msg =
          typeof err?.message === "string" && err.message
            ? err.message
            : [err?.code, err?.type].filter(Boolean).join(" ") || "Payment checkout failed.";
        console.error("Cashfree checkout error:", err);
        toast.error(msg);
        return;
      }

      // Payment succeeded — verify on backend and credit coins
      try {
        await completePurchaseViaEdge(selectedId, orderData.orderId as string);
      } catch (err) {
        console.error("Payment verification error:", err);
        toast.error("Payment was received but verification failed. Contact support.");
      }
    } catch (err) {
      console.error("Purchase error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to purchase coins. Please try again.");
    } finally {
      setIsPurchasing(false);
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
          className="relative w-full max-w-lg bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Coins className="w-6 h-6 text-bunny-gold" />
                Buy Coins
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select a package to get started
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Packages */}
          <div className="px-6 pb-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : packages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No packages available right now.
              </p>
            ) : (
              packages.map((pkg, index) => {
                const Icon = packageIcons[index % packageIcons.length];
                const isSelected = selectedId === pkg.id;

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedId(pkg.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border/50 hover:border-primary/30 bg-card"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "gradient-primary" : "bg-primary/10"
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-lg">
                          {formatNumber(pkg.coins)}
                        </span>
                        <span className="text-sm text-muted-foreground">coins</span>
                        {pkg.bonus_percent > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bunny-gold/20 text-bunny-gold text-xs font-semibold">
                            <Sparkles className="w-3 h-3" />
                            +{pkg.bonus_percent}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ~{Math.floor(pkg.coins / 10)} minutes of video chat
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-bold text-lg">
                        ₹{formatNumber(pkg.price_inr)}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center mt-1 ml-auto">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-border/50">
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!selectedId || isPurchasing}
              onClick={handlePurchase}
            >
              {isPurchasing ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {isPurchasing ? "Processing..." : "Purchase"}
            </Button>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-primary" /> Secure Payment
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-primary" /> Instant Activation
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
