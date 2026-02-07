import PageLayout from "@/components/landing/PageLayout";
import { UserPlus, Search, Coins, Video, Gift, Star, CheckCircle, Clock, Wallet } from "lucide-react";

const userSteps = [
  { icon: UserPlus, title: "Sign Up Free", desc: "Create your account and get 5 free minutes with trial coins — no credit card needed." },
  { icon: Search, title: "Browse Creators", desc: "Filter by country, language, rating, and availability to find the perfect match." },
  { icon: Coins, title: "Buy Coins", desc: "₹200 = 1200 coins. Pay via UPI, debit/credit cards, or net banking through secure payment." },
  { icon: Video, title: "Start Video Chat", desc: "HD video quality with real-time text translation. Chat in your language!" },
  { icon: Gift, title: "Send Gifts", desc: "Show appreciation with virtual flowers, gifts, diamonds, and crowns." },
  { icon: Star, title: "Rate Your Experience", desc: "Leave ratings to help others find the best creators on the platform." },
];

const creatorSteps = [
  { icon: CheckCircle, title: "Apply as Creator", desc: "Complete age verification and set up your profile with bio and photos." },
  { icon: Clock, title: "Go Online", desc: "Set your availability and preferred hours. Start receiving calls instantly." },
  { icon: Coins, title: "Chat & Earn", desc: "Earn 4-8 coins per minute based on your rating tier. Higher ratings = higher pay." },
  { icon: Star, title: "Build Your Rating", desc: "Provide amazing experiences to climb tiers: Standard → Bronze → Silver → Gold → Platinum." },
  { icon: Gift, title: "Receive Gifts", desc: "100% of the gift value goes directly to your earnings balance." },
  { icon: Wallet, title: "Withdraw Earnings", desc: "Cash out via bank transfer or UPI. Minimum withdrawal: ₹500. Processed in 3-5 days." },
];

const StepCard = ({ step, index }: { step: typeof userSteps[0]; index: number }) => (
  <div className="glass rounded-xl p-6 border border-border/30 flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
      {index + 1}
    </div>
    <div>
      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
      <p className="text-muted-foreground text-sm">{step.desc}</p>
    </div>
  </div>
);

const HowItWorksPage = () => {
  return (
    <PageLayout title="How Bunny Desires Works">
      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">For Users</h2>
        <div className="grid gap-4">
          {userSteps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">For Creators</h2>
        <div className="grid gap-4">
          {creatorSteps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorksPage;
