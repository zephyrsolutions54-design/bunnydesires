import PageLayout from "@/components/landing/PageLayout";

const CommunityGuidelinesPage = () => {
  return (
    <PageLayout title="Community Guidelines" lastUpdated="February 2026">
      <p className="text-muted-foreground text-lg">
        These guidelines ensure Bunny Desires remains a safe, respectful, and enjoyable platform for everyone.
      </p>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-destructive">🚫 Zero Tolerance</h2>
        <p className="text-muted-foreground">The following will result in immediate, permanent ban:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Nudity or sexual content of any kind</li>
          <li>Sexual solicitation or prostitution</li>
          <li>Harassment, threats, or hate speech</li>
          <li>Content involving minors</li>
          <li>Impersonation or fraud</li>
          <li>Sharing illegal content</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">✅ Expected Behavior</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Treat every user with respect and dignity</li>
          <li>Be honest in your profile information</li>
          <li>Respect boundaries set by other users</li>
          <li>Use appropriate language at all times</li>
          <li>Report violations to help keep the community safe</li>
          <li>Accept when someone declines or ends a call</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">⚠️ Not Allowed</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Sharing personal contact information on the platform</li>
          <li>Recording calls without consent</li>
          <li>Using VPNs to bypass regional restrictions</li>
          <li>Creating multiple accounts</li>
          <li>Using bots or automated tools</li>
          <li>Spamming or excessive self-promotion</li>
          <li>Manipulating the rating system</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Enforcement</h2>
        <p className="text-muted-foreground">Violations are handled based on severity:</p>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li><strong>Warning:</strong> First minor offense — you'll receive a written notice.</li>
          <li><strong>Temporary Suspension:</strong> Repeated minor offenses — 7 to 30 day suspension.</li>
          <li><strong>Permanent Ban:</strong> Severe violations or continued offenses — account permanently terminated.</li>
        </ol>
        <p className="text-muted-foreground">
          All decisions can be appealed by emailing{" "}
          <a href="mailto:appeals@bunnydesires.com" className="text-primary hover:underline">appeals@bunnydesires.com</a>.
        </p>
      </section>
    </PageLayout>
  );
};

export default CommunityGuidelinesPage;
