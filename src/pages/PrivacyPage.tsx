import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary fill-primary" />
              <span className="font-display font-bold text-lg text-gradient">
                Bunny Desires
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="font-display text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: February 2026
          </p>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, 
              make a purchase, or contact us for support. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Name, email address, and phone number</li>
              <li>Profile information (bio, photos, country)</li>
              <li>Payment information (processed securely via Razorpay)</li>
              <li>Communication preferences</li>
              <li>Usage data and interaction history</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal information to outside parties 
              except as described in this policy. We may share information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information, 
              including encryption, secure servers, and regular security audits. However, no method 
              of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">5. Your Rights (IT Act 2000)</h2>
            <p className="text-muted-foreground">
              Under the Information Technology Act, 2000 and the IT (Reasonable Security Practices) Rules, 
              2011, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Withdraw consent for data processing</li>
              <li>Request deletion of your account and data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">6. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to collect information about your browsing 
              activities and to distinguish you from other users. You can control cookies through 
              your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">7. Age Restriction</h2>
            <p className="text-muted-foreground">
              Our services are intended for users who are 18 years of age or older. We do not 
              knowingly collect personal information from individuals under 18.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: privacy@bunnydesires.com<br />
              Address: Mumbai, India
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
