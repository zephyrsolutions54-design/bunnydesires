import PageLayout from "@/components/landing/PageLayout";

const CookiePolicyPage = () => {
  return (
    <PageLayout title="Cookie Policy" lastUpdated="February 2026">
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">What Are Cookies?</h2>
        <p className="text-muted-foreground">
          Cookies are small text files stored on your device when you visit our website. They help us provide a better experience by remembering your preferences and understanding how you use our platform.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Types of Cookies We Use</h2>

        <div className="space-y-6">
          <div className="glass rounded-xl p-6 border border-border/30">
            <h3 className="font-semibold text-lg mb-2">Essential Cookies</h3>
            <p className="text-muted-foreground mb-2">Required for basic platform functionality:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Session management and authentication</li>
              <li>Security features and CSRF protection</li>
              <li>Load balancing</li>
            </ul>
            <p className="text-sm text-primary mt-2">These cannot be disabled.</p>
          </div>

          <div className="glass rounded-xl p-6 border border-border/30">
            <h3 className="font-semibold text-lg mb-2">Analytics Cookies</h3>
            <p className="text-muted-foreground mb-2">Help us understand usage patterns:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Google Analytics for usage statistics</li>
              <li>Performance monitoring</li>
              <li>Error tracking</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">Can be disabled in your browser settings.</p>
          </div>

          <div className="glass rounded-xl p-6 border border-border/30">
            <h3 className="font-semibold text-lg mb-2">Preference Cookies</h3>
            <p className="text-muted-foreground mb-2">Remember your choices:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Language selection</li>
              <li>Theme preferences</li>
              <li>Volume and notification settings</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Managing Cookies</h2>
        <p className="text-muted-foreground">You can control cookies through your browser settings:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
          <li><strong>Firefox:</strong> Options → Privacy &amp; Security → Cookies</li>
          <li><strong>Safari:</strong> Preferences → Privacy</li>
          <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Third-Party Cookies</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Google Analytics (usage analytics)</li>
          <li>Razorpay (payment processing)</li>
          <li>CDN providers (content delivery)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Contact</h2>
        <p className="text-muted-foreground">
          Questions about our cookie practices? Email us at{" "}
          <a href="mailto:privacy@bunnydesires.com" className="text-primary hover:underline">
            privacy@bunnydesires.com
          </a>
        </p>
      </section>
    </PageLayout>
  );
};

export default CookiePolicyPage;
