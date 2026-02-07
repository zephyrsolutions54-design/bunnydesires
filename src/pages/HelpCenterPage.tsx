import { useState } from "react";
import PageLayout from "@/components/landing/PageLayout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqCategories = [
  {
    category: "Getting Started",
    faqs: [
      { q: "How do I get started?", a: "Sign up for free and receive 300 trial coins (about 5 free minutes). Browse online creators, and start chatting instantly — no credit card required!" },
      { q: "Is registration free?", a: "Yes! Registration is completely free. You also get 5 free minutes of trial chat time when you sign up." },
      { q: "What are trial coins?", a: "Trial coins are free coins given to new users. They work like regular coins during calls, but creator earnings from trial calls only become withdrawable when you make your first purchase." },
    ],
  },
  {
    category: "Payments & Coins",
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept UPI, debit/credit cards, net banking, and digital wallets through Razorpay — India's most trusted payment gateway." },
      { q: "Are my payments secure?", a: "Absolutely. All payments are processed through Razorpay, a PCI DSS compliant payment gateway. We never store your card details." },
      { q: "How much does it cost?", a: "Video chat costs 10 coins per minute (approximately ₹1.67/min). Coin packages start at ₹200 for 1200 coins." },
      { q: "Can I get a refund?", a: "Coin purchases are generally non-refundable. However, if you experience a technical issue, contact support and we'll review your case." },
    ],
  },
  {
    category: "Video Chat",
    faqs: [
      { q: "Is video chat really translated?", a: "Text messages are auto-translated in real-time. You can type messages in your language and the creator will see them in theirs." },
      { q: "What quality is the video?", a: "We use HD video with adaptive bitrate to ensure the best quality based on your internet connection." },
      { q: "Can I block someone?", a: "Yes. Click the menu icon during chat and select 'Block User'. The user will no longer be able to contact you." },
    ],
  },
  {
    category: "Creator Earnings",
    faqs: [
      { q: "How does the rating system work?", a: "After each call, users rate creators 1-5 stars. Higher average ratings unlock higher earning tiers: Standard (4 coins/min), Bronze (5), Silver (6), Gold (7), Platinum (8 coins/min)." },
      { q: "How do I withdraw my earnings?", a: "Go to Dashboard → Earnings → Withdraw. Choose bank transfer or UPI. Minimum withdrawal is ₹500. Funds typically arrive in 3-5 business days." },
      { q: "What are trial earnings?", a: "When a trial user chats with you, your earnings are marked as 'pending trial'. They convert to real withdrawable earnings when that user makes their first purchase. If they never purchase, trial earnings expire after 30 days." },
    ],
  },
  {
    category: "Safety & Privacy",
    faqs: [
      { q: "How do you verify users?", a: "All users must be 18+. Creators undergo additional ID verification. We use automated and manual moderation to maintain safety." },
      { q: "What happens when I report someone?", a: "Our safety team reviews every report within 24 hours. Violators may receive warnings, suspensions, or permanent bans depending on severity." },
      { q: "Is my personal data safe?", a: "Yes. We comply with the IT Act 2000 and Digital Personal Data Protection Act 2023. All data is encrypted and we never sell personal information." },
    ],
  },
];

const HelpCenterPage = () => {
  const [search, setSearch] = useState("");
  const lowerSearch = search.toLowerCase();

  const filtered = faqCategories
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (f) => f.q.toLowerCase().includes(lowerSearch) || f.a.toLowerCase().includes(lowerSearch)
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  return (
    <PageLayout title="Help Center">
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No results found. Try a different search term or{" "}
          <a href="mailto:support@bunnydesires.com" className="text-primary hover:underline">contact support</a>.
        </p>
      ) : (
        filtered.map((cat) => (
          <section key={cat.category} className="space-y-3">
            <h2 className="font-display text-xl font-semibold">{cat.category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {cat.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`${cat.category}-${i}`} className="glass rounded-xl border border-border/30 px-4">
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))
      )}

      <section className="glass rounded-xl p-6 border border-border/30 text-center">
        <p className="text-muted-foreground">
          Can't find what you're looking for?{" "}
          <a href="mailto:support@bunnydesires.com" className="text-primary hover:underline">
            Email our support team
          </a>{" "}
          — we typically respond within 24 hours.
        </p>
      </section>
    </PageLayout>
  );
};

export default HelpCenterPage;
