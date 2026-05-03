import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  ArrowLeft,
  Coins,
  Video,
  Gift,
  ShoppingCart,
  Wallet,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactionHistory, type TransactionRecord } from "@/hooks/useRecentActivity";
import { SEOHead } from "@/components/SEOHead";
import { TransactionListSkeleton } from "@/components/skeletons/DashboardSkeleton";

const typeConfig: Record<
  string,
  { label: string; icon: typeof Coins; color: string; bg: string; sign: "+" | "-" }
> = {
  coin_purchase: { label: "Coin Purchase", icon: ShoppingCart, color: "text-green-500", bg: "bg-green-500/10", sign: "+" },
  call_deduction: { label: "Video Call", icon: Video, color: "text-blue-500", bg: "bg-blue-500/10", sign: "-" },
  gift_sent: { label: "Gift Sent", icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10", sign: "-" },
  gift_received: { label: "Gift Received", icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10", sign: "+" },
  earnings_credit: { label: "Earnings", icon: Wallet, color: "text-green-500", bg: "bg-green-500/10", sign: "+" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-orange-500", bg: "bg-orange-500/10", sign: "-" },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
};

const TransactionHistoryPage = () => {
  const navigate = useNavigate();
  const { wallet } = useAuth();
  const { transactions, loading } = useTransactionHistory();

  const totalSpent = transactions
    .filter((t) => t.type === "call_deduction" || t.type === "gift_sent")
    .reduce((sum, t) => sum + t.coins, 0);

  const totalPurchased = transactions
    .filter((t) => t.type === "coin_purchase")
    .reduce((sum, t) => sum + t.coins, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Transaction History" description="View your coin purchase and spending history." path="/transactions" />
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <Heart className="w-7 h-7 text-primary fill-primary" />
                <span className="font-display font-bold text-lg text-gradient hidden sm:inline">
                  Bunny Desires
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bunny-gold/10 border border-bunny-gold/20">
              <Wallet className="w-4 h-4 text-bunny-gold" />
              <span className="font-semibold text-bunny-gold">
                {wallet?.balance?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold mb-6">Transaction History</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownLeft className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Total Purchased</span>
              </div>
              <p className="text-xl font-bold flex items-center gap-1">
                <Coins className="w-4 h-4 text-bunny-gold" />
                {totalPurchased.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Total Spent</span>
              </div>
              <p className="text-xl font-bold flex items-center gap-1">
                <Coins className="w-4 h-4 text-bunny-gold" />
                {totalSpent.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TransactionListSkeleton />
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground">
                  Your purchase and spending history will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx, index) => (
                  <TransactionRow key={tx.id} tx={tx} index={index} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

function TransactionRow({ tx, index }: { tx: TransactionRecord; index: number }) {
  const config = typeConfig[tx.type] || typeConfig.coin_purchase;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
    >
      <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{config.label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {tx.description || (tx.related_user_name ? `with ${tx.related_user_name}` : "")}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-semibold text-sm flex items-center gap-1 justify-end ${
          config.sign === "+" ? "text-green-500" : "text-red-400"
        }`}>
          {config.sign}{tx.coins.toLocaleString()}
          <Coins className="w-3 h-3 text-bunny-gold" />
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
      </div>
    </motion.div>
  );
}

export default TransactionHistoryPage;
