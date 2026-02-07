import PageLayout from "@/components/landing/PageLayout";

const TermsPage = () => {
  return (
    <PageLayout title="Terms of Service" lastUpdated="February 2026">
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By accessing or using Bunny Desires, you agree to be bound by these Terms of Service
          and our Privacy Policy. If you do not agree, please do not use our services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">2. Eligibility</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Must be 18 years or older</li>
          <li>Must provide accurate registration information</li>
          <li>Must comply with Indian laws</li>
          <li>Prohibited persons: Convicted sex offenders, previously banned users</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">3. Account Types</h2>
        <h3 className="font-semibold text-lg">User Accounts (Men)</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Purchase coins for video chat</li>
          <li>Rate and send gifts to creators</li>
          <li>Responsible for account security</li>
        </ul>
        <h3 className="font-semibold text-lg">Creator Accounts (Women)</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Earn from video chat time and gifts</li>
          <li>Must maintain community standards</li>
          <li>Earnings subject to rating-based tier system</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">4. Payment Terms</h2>
        <h3 className="font-semibold text-lg">Coin Purchases</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Non-refundable except in cases of technical failure</li>
          <li>Prices listed in INR, inclusive of applicable GST</li>
          <li>Payment via Razorpay (secure gateway)</li>
        </ul>
        <h3 className="font-semibold text-lg">Trial Offer</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>New users receive 300 trial coins (≈5 minutes)</li>
          <li>Trial coins are non-transferable; one trial per person</li>
          <li>Creator trial earnings convert to real earnings upon first purchase</li>
          <li>Unconverted trial earnings expire after 30 days</li>
        </ul>
        <h3 className="font-semibold text-lg">Creator Earnings</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Based on call duration and rating tier (4-8 coins/min)</li>
          <li>Minimum withdrawal: ₹500</li>
          <li>Processing time: 3-5 business days</li>
          <li>TDS deducted as per Indian tax law (if applicable)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">5. Prohibited Conduct</h2>
        <p className="text-muted-foreground">Users SHALL NOT:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Share nudity or sexual content</li>
          <li>Harass, threaten, or abuse others</li>
          <li>Use the service for prostitution or illegal activities</li>
          <li>Share personal contact information on the platform</li>
          <li>Record calls without consent</li>
          <li>Create multiple accounts</li>
          <li>Use VPN to bypass geo-restrictions</li>
          <li>Impersonate others or use bots/automated tools</li>
        </ul>
        <p className="text-muted-foreground">
          Violations result in warning, suspension, or permanent ban.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">6. Content Moderation</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>AI-powered content monitoring</li>
          <li>Manual review of reported content</li>
          <li>Zero tolerance for illegal content</li>
          <li>Report button available on all chats</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">7. Intellectual Property</h2>
        <p className="text-muted-foreground">
          You retain rights to your content but grant us a license to display it on the platform.
          Bunny Desires trademarks are our property. Do not use our IP without written permission.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">8. Disclaimer of Warranties</h2>
        <p className="text-muted-foreground">
          Service provided "AS IS." No guarantee of uninterrupted service, matches, or connections.
          We are not responsible for user conduct or third-party payment processor issues.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">9. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          Our liability is limited to the amount you paid in the last 12 months. We are not liable
          for indirect, incidental, special, or consequential damages, lost profits, user misconduct,
          or third-party actions.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">10. Dispute Resolution</h2>
        <p className="text-muted-foreground">
          Governed by the laws of India. Exclusive jurisdiction of Mumbai, Maharashtra courts.
          Disputes resolved through arbitration under the Arbitration and Conciliation Act, 1996.
          Seat: Mumbai. Language: English. Single arbitrator.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">11. Account Termination</h2>
        <p className="text-muted-foreground">
          We may terminate accounts for terms violations, illegal activity, fraudulent behavior,
          or extended inactivity (3+ years). You may delete your account at any time.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">12. Changes to Terms</h2>
        <p className="text-muted-foreground">
          We reserve the right to modify these terms with 30 days advance notice via email.
          Continued use constitutes acceptance of updated terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">13. Contact</h2>
        <p className="text-muted-foreground">
          Email:{" "}
          <a href="mailto:legal@bunnydesires.com" className="text-primary hover:underline">
            legal@bunnydesires.com
          </a>
          <br />
          Address: Mumbai, India
        </p>
      </section>
    </PageLayout>
  );
};

export default TermsPage;
