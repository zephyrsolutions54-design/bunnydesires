import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Loader2,
  DollarSign,
  Coins,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const paymentMethods = [
  { id: "upi", label: "UPI", placeholder: "yourname@upi" },
  { id: "bank", label: "Bank Transfer", placeholder: "Account number" },
];

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const { earnings, refreshProfile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentDetail, setPaymentDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const availableCoins = earnings?.available_balance || 0;
  const availableInr = (availableCoins / 6).toFixed(2);

  const handleSubmit = async () => {
    if (!paymentDetail.trim()) {
      toast.error("Please enter your payment details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("request-withdrawal", {
        body: {
          amount: availableCoins,
          paymentMethod,
          paymentDetails: {
            [paymentMethod === "upi" ? "upi_id" : "account_number"]: paymentDetail.trim(),
          },
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setIsSuccess(true);
      await refreshProfile();
      toast.success("Withdrawal request submitted!");
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast.error("Failed to submit withdrawal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setPaymentDetail("");
    setPaymentMethod("upi");
    onClose();
  };

  if (!isOpen) return null;

  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethod)!;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

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
                <DollarSign className="w-6 h-6 text-green-500" />
                Withdraw Earnings
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Withdraw your available balance
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSuccess ? (
            <div className="px-6 pb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-display text-lg font-bold">Request Submitted</h3>
                <p className="text-sm text-muted-foreground">
                  Your withdrawal of ₹{availableInr} has been submitted. It will be
                  processed within 24-48 hours.
                </p>
                <Button variant="hero" className="w-full" onClick={handleClose}>
                  Done
                </Button>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Amount */}
              <div className="px-6 mb-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Withdrawal Amount</p>
                  <p className="text-3xl font-display font-bold text-green-500">
                    ₹{availableInr}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Coins className="w-3 h-3" />
                    {availableCoins.toLocaleString()} coins
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="px-6 space-y-4 pb-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-primary/30"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDetail">{selectedMethod.label} Details</Label>
                  <Input
                    id="paymentDetail"
                    placeholder={selectedMethod.placeholder}
                    value={paymentDetail}
                    onChange={(e) => setPaymentDetail(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-border/50">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={!paymentDetail.trim() || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <DollarSign className="w-5 h-5 mr-2" />
                  )}
                  {isSubmitting ? "Processing..." : `Withdraw ₹${availableInr}`}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Withdrawals are processed within 24-48 hours
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
