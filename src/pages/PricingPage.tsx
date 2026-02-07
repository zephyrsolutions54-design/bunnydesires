import PageLayout from "@/components/landing/PageLayout";
import { Check } from "lucide-react";
import { useCoinPackages } from "@/hooks/useCoinPackages";

const giftPricing = [
  { emoji: "🌹", name: "Rose", coins: 50, inr: "₹8" },
  { emoji: "💝", name: "Gift Box", coins: 200, inr: "₹33" },
  { emoji: "💎", name: "Diamond", coins: 500, inr: "₹83" },
  { emoji: "👑", name: "Crown", coins: 1000, inr: "₹167" },
];

const PricingPage = () => {
  const { packages, loading: isLoading } = useCoinPackages();

  return (
    <PageLayout title="Simple, Transparent Pricing">
      <p className="text-muted-foreground text-lg mb-8">
        No subscriptions. No hidden fees. Pay only for what you use.
      </p>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">Coin Packages</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading packages...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {packages?.map((pkg) => (
              <div
                key={pkg.id}
                className={`glass rounded-xl p-6 border transition-colors ${
                  pkg.is_popular ? "border-primary shadow-glow" : "border-border/30"
                }`}
              >
                {pkg.is_popular && (
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">🔥 Popular</span>
                )}
                <h3 className="font-display text-xl font-bold mt-1">₹{pkg.price_inr}</h3>
                <p className="text-2xl font-bold text-primary">{pkg.coins.toLocaleString()} coins</p>
                {pkg.bonus_percent ? (
                  <p className="text-sm text-primary font-medium">+{pkg.bonus_percent}% bonus</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Chat Rates</h2>
        <div className="glass rounded-xl p-6 border border-border/30">
          <p className="text-muted-foreground">
            <strong className="text-foreground">10 coins per minute</strong> = approximately ₹1.67/min = ₹100/hour
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">🎁 Virtual Gifts</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {giftPricing.map((g) => (
            <div key={g.name} className="glass rounded-xl p-4 border border-border/30 flex items-center gap-3">
              <span className="text-2xl">{g.emoji}</span>
              <div>
                <p className="font-semibold">{g.name}</p>
                <p className="text-sm text-muted-foreground">{g.coins} coins ({g.inr})</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">What's Included</h2>
        <ul className="space-y-2">
          {["No hidden fees", "No subscription required", "Pay only for what you use", "Secure Razorpay payments", "5 free trial minutes for new users"].map((item) => (
            <li key={item} className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  );
};

export default PricingPage;
