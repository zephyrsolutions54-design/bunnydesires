import PageLayout from "@/components/landing/PageLayout";
import { Shield, Eye, Ban, Lock, Scale } from "lucide-react";

const SafetyPage = () => {
  return (
    <PageLayout title="Your Safety Matters">
      <p className="text-muted-foreground text-lg">
        We've built Bunny Desires with safety as our top priority. Here's how we protect you.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Shield, title: "Verification", items: ["Age verification for all users (18+)", "ID verification for creators", "Photo verification checks"] },
          { icon: Eye, title: "Monitoring", items: ["AI-powered content moderation", "24/7 human review team", "Automated detection of inappropriate content"] },
          { icon: Ban, title: "Report & Block", items: ["One-click report button on every chat", "Instant block functionality", "Response to reports within 24 hours"] },
          { icon: Lock, title: "Privacy", items: ["No sharing of personal information", "Encrypted communications", "Secure payment processing via Razorpay"] },
        ].map((s) => (
          <div key={s.title} className="glass rounded-xl p-6 border border-border/30">
            <s.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-3">{s.title}</h3>
            <ul className="space-y-1">
              {s.items.map((item) => (
                <li key={item} className="text-muted-foreground text-sm">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary" /> Community Guidelines
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Zero tolerance for harassment or abuse</li>
          <li>No nudity or sexual content of any kind</li>
          <li>Respectful behavior is required at all times</li>
          <li>No sharing personal contact information on the platform</li>
          <li>No recording of video calls without consent</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Safety Tips for Users</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Never share personal contact information</li>
          <li>Report suspicious behavior immediately</li>
          <li>Don't send money outside the platform</li>
          <li>Use the block feature if you feel uncomfortable</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Safety Tips for Creators</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Set clear boundaries from the start</li>
          <li>End calls that make you uncomfortable</li>
          <li>Report users who violate guidelines</li>
          <li>Never agree to meet users in person</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Need Help?</h2>
        <p className="text-muted-foreground">
          <strong>24/7 Safety Team:</strong>{" "}
          <a href="mailto:safety@bunnydesires.com" className="text-primary hover:underline">safety@bunnydesires.com</a>
        </p>
      </section>
    </PageLayout>
  );
};

export default SafetyPage;
