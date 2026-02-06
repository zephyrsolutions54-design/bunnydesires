import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Zap, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const packages = [
  {
    coins: 1200,
    price: 200,
    bonus: 0,
    popular: false,
    icon: Zap,
  },
  {
    coins: 3200,
    price: 500,
    bonus: 7,
    popular: false,
    icon: Gift,
  },
  {
    coins: 7000,
    price: 1000,
    bonus: 16,
    popular: true,
    icon: Sparkles,
  },
  {
    coins: 15000,
    price: 2000,
    bonus: 25,
    popular: false,
    icon: Crown,
  },
];

const formatNumber = (num: number) => {
  return num.toLocaleString("en-IN");
};

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Simple, Transparent{" "}
            <span className="text-gradient">Coin Packages</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Purchase coins and enjoy video chats at just ₹1.67 per minute. 
            The more you buy, the more you save!
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${pkg.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-semibold z-10">
                  Most Popular
                </div>
              )}
              
              <div className={`h-full p-6 rounded-2xl border transition-all duration-300 ${
                pkg.popular 
                  ? "bg-card shadow-glow border-primary/50" 
                  : "bg-card shadow-card border-border/50 hover:border-primary/30"
              }`}>
                <div className="text-center mb-6">
                  <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    pkg.popular ? "gradient-primary" : "bg-primary/10"
                  }`}>
                    <pkg.icon className={`w-7 h-7 ${
                      pkg.popular ? "text-primary-foreground" : "text-primary"
                    }`} />
                  </div>
                  
                  <div className="font-display text-3xl font-bold text-gradient mb-1">
                    {formatNumber(pkg.coins)}
                  </div>
                  <div className="text-sm text-muted-foreground">Coins</div>
                  
                  {pkg.bonus > 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bunny-gold/20 text-bunny-gold text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      +{pkg.bonus}% Bonus
                    </div>
                  )}
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold font-display">
                    ₹{formatNumber(pkg.price)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ₹{(pkg.price / pkg.coins * 100).toFixed(2)}/100 coins
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    `${Math.floor(pkg.coins / 10)} minutes of video chat`,
                    "Real-time translation included",
                    "Send virtual gifts",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth?mode=signup">
                  <Button 
                    variant={pkg.popular ? "hero" : "outline"} 
                    className="w-full"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Secure Payments
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            UPI, Cards & Wallets
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary" />
            Instant Activation
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
