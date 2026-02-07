import PageLayout from "@/components/landing/PageLayout";

const PrivacyPage = () => {
  return (
    <PageLayout title="Privacy Policy" lastUpdated="February 2026">
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">1. Introduction</h2>
        <p className="text-muted-foreground">
          Bunny Desires ("we," "us," "our") operates the video chat platform at bunnydesires.com.
          We are committed to protecting your privacy and personal data in accordance with the
          Information Technology Act, 2000, the IT (Reasonable Security Practices) Rules, 2011,
          and the Digital Personal Data Protection Act, 2023.
        </p>
        <p className="text-muted-foreground">
          <strong>Contact:</strong> privacy@bunnydesires.com<br />
          <strong>Address:</strong> Mumbai, India
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">2. Information We Collect</h2>
        <h3 className="font-semibold text-lg">Personal Information</h3>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Name, email address, and phone number</li>
          <li>Date of birth (age verification)</li>
          <li>Profile information (bio, photos, country)</li>
          <li>Payment information (processed securely via Razorpay)</li>
          <li>Government ID for creator verification (encrypted storage)</li>
        </ul>
        <h3 className="font-semibold text-lg">Usage Data</h3>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Call duration and frequency (not content)</li>
          <li>Coins purchased and spent</li>
          <li>Device information and IP address</li>
          <li>Browser type and operating system</li>
        </ul>
        <h3 className="font-semibold text-lg">Sensitive Personal Data</h3>
        <p className="text-muted-foreground">
          Financial information (bank details for withdrawals) and government-issued ID (for age verification only)
          are handled per IT Rules 2011.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Facilitate video chat connections</li>
          <li>Process transactions and send related information</li>
          <li>Verify age (18+ requirement)</li>
          <li>Improve service quality and prevent fraud</li>
          <li>Comply with legal obligations</li>
          <li>Send service updates (with consent)</li>
          <li>Monitor and analyze trends, usage, and activities</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">4. Information Sharing</h2>
        <p className="text-muted-foreground">
          We <strong>do not sell</strong> your personal data. We share data only with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Payment processors (Razorpay – PCI DSS compliant)</li>
          <li>Cloud storage providers (encrypted)</li>
          <li>Law enforcement (when legally required)</li>
          <li>With your consent or at your direction</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">5. Data Security</h2>
        <p className="text-muted-foreground">
          All data is encrypted in transit (SSL/TLS) and sensitive data encrypted at rest (AES-256).
          We conduct regular security audits and implement strict access controls. No method of
          transmission over the Internet is 100% secure.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">6. Your Rights (DPDP Act 2023 & IT Act 2000)</h2>
        <p className="text-muted-foreground">You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your account and data</li>
          <li>Withdraw consent for data processing</li>
          <li>Data portability</li>
          <li>Lodge a complaint with the Data Protection Board</li>
        </ul>
        <p className="text-muted-foreground">
          To exercise these rights, email{" "}
          <a href="mailto:dataprotection@bunnydesires.com" className="text-primary hover:underline">
            dataprotection@bunnydesires.com
          </a>
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">7. Data Retention</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Active accounts: Data retained while account active</li>
          <li>Inactive accounts: Deleted after 3 years</li>
          <li>Financial records: 7 years (legal requirement)</li>
          <li>Call logs: 90 days</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">8. Cookies</h2>
        <p className="text-muted-foreground">
          We use cookies for session management, authentication, analytics, and preferences.
          See our{" "}
          <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>{" "}
          for details. Manage cookies in your browser settings.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">9. Children's Privacy</h2>
        <p className="text-muted-foreground">
          Our service is 18+ only. We do not knowingly collect personal information from minors.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">10. Grievance Officer</h2>
        <p className="text-muted-foreground">
          As required under the IT Act 2000:<br />
          Email:{" "}
          <a href="mailto:grievance@bunnydesires.com" className="text-primary hover:underline">
            grievance@bunnydesires.com
          </a>
          <br />
          Response Time: 30 days
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">11. Governing Law</h2>
        <p className="text-muted-foreground">
          This policy is governed by the laws of India. Jurisdiction: Mumbai courts.
        </p>
      </section>
    </PageLayout>
  );
};

export default PrivacyPage;
