import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsPage = () => {
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

        <h1 className="font-display text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: February 2026
          </p>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Bunny Desires, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">2. Eligibility</h2>
            <p className="text-muted-foreground">
              You must be at least 18 years old to use Bunny Desires. By using our services, 
              you represent and warrant that you are at least 18 years of age and have the 
              legal capacity to enter into these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You may not share your account with others</li>
              <li>You must notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">4. Prohibited Conduct</h2>
            <p className="text-muted-foreground">
              You agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Share explicit, adult, or inappropriate content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate others or provide false information</li>
              <li>Use the service for illegal purposes</li>
              <li>Attempt to hack, disrupt, or exploit the platform</li>
              <li>Engage in fraudulent transactions</li>
              <li>Solicit personal information from other users</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">5. Coin Purchases & Payments</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>All coin purchases are final and non-refundable</li>
              <li>Coins have no cash value outside the platform</li>
              <li>Unused coins may expire after 12 months of account inactivity</li>
              <li>We reserve the right to modify coin prices with notice</li>
              <li>Payments are processed securely through Razorpay</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">6. Creator Earnings & Withdrawals</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Creators earn coins from video chat time and gifts received</li>
              <li>Minimum withdrawal amount is ₹500</li>
              <li>Withdrawals are processed within 3-5 business days</li>
              <li>Creators are responsible for reporting their income for tax purposes</li>
              <li>We may withhold earnings if fraud is suspected</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">7. Account Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Harmful behavior toward other users</li>
              <li>Inactivity for extended periods</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Bunny Desires is provided "as is" without warranties of any kind. We are not 
              liable for any indirect, incidental, special, or consequential damages arising 
              from your use of the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">9. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Any disputes arising from these Terms shall be governed by the laws of India 
              and subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">10. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: legal@bunnydesires.com<br />
              Address: Mumbai, India
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
