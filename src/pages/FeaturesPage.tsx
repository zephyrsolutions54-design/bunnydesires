import PageLayout from "@/components/landing/PageLayout";
import { Video, Globe, Languages, Star, Gift, CreditCard, Lock, Smartphone, Zap, DollarSign, Shield, BarChart3 } from "lucide-react";

const features = [
  { icon: Video, title: "HD Video Chat", desc: "Crystal-clear video quality with adaptive bitrate for smooth calls on any connection." },
  { icon: Globe, title: "Global Connections", desc: "Connect with people from 50+ countries and discover new cultures." },
  { icon: Languages, title: "Real-Time Translation", desc: "Chat in your language — text messages are auto-translated instantly." },
  { icon: Star, title: "Rating System", desc: "Find top-rated creators easily with our transparent 5-star rating system." },
  { icon: Gift, title: "Virtual Gifts", desc: "Express appreciation with roses, gifts, diamonds, and crowns." },
  { icon: CreditCard, title: "Secure Payments", desc: "Razorpay integration with UPI, cards, net banking and more." },
  { icon: Lock, title: "Privacy First", desc: "Encrypted communications and strict data protection policies." },
  { icon: Smartphone, title: "Mobile Friendly", desc: "Works seamlessly on all devices — desktop, tablet, and mobile." },
  { icon: Zap, title: "Instant Matching", desc: "Browse online creators and start chatting within seconds." },
  { icon: DollarSign, title: "Fair Earnings", desc: "Transparent, rating-based compensation for creators (4-8 coins/min)." },
  { icon: Shield, title: "Safety Features", desc: "Report, block, and AI-powered content moderation tools." },
  { icon: BarChart3, title: "Creator Dashboard", desc: "Track earnings, ratings, call history, and performance metrics." },
];

const FeaturesPage = () => {
  return (
    <PageLayout title="Features">
      <p className="text-muted-foreground text-lg mb-8">
        Everything you need for meaningful global connections, built into one platform.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="glass rounded-xl p-6 border border-border/30 hover:border-primary/40 transition-colors">
            <f.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default FeaturesPage;
