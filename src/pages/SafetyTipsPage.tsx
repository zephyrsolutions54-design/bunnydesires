import PageLayout from "@/components/landing/PageLayout";

const SafetyTipsPage = () => {
  return (
    <PageLayout title="Safety Tips">
      <p className="text-muted-foreground text-lg">
        Stay safe while enjoying meaningful connections on Bunny Desires.
      </p>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">For Everyone</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Never share personal information like phone numbers, addresses, or social media accounts on the platform.</li>
          <li>Don't send or receive money outside of the official Bunny Desires platform.</li>
          <li>If something feels wrong, trust your instincts and end the call.</li>
          <li>Report suspicious behavior immediately using the in-app report button.</li>
          <li>Use a strong, unique password for your account.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">For Users</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Be respectful to creators at all times.</li>
          <li>Understand that creators can end a call at any time if they feel uncomfortable.</li>
          <li>Do not request personal contact information or off-platform meetings.</li>
          <li>Never record video calls without explicit consent.</li>
          <li>Report profiles that seem fake or suspicious.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">For Creators</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Set clear boundaries from the beginning of every chat.</li>
          <li>Don't hesitate to end a call if a user makes you uncomfortable.</li>
          <li>Never share personal information with users.</li>
          <li>Report any form of harassment or inappropriate behavior.</li>
          <li>Never agree to meet users in person.</li>
          <li>Keep your withdrawal bank details up to date for smooth payouts.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Recognizing Scams</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Be wary of users who immediately ask for personal contact details.</li>
          <li>Don't click on external links sent by other users.</li>
          <li>We will never ask for your password via chat or email.</li>
          <li>Official communications only come from @bunnydesires.com email addresses.</li>
        </ul>
      </section>

      <section className="glass rounded-xl p-6 border border-border/30">
        <h2 className="font-display text-xl font-semibold mb-2">Need Help?</h2>
        <p className="text-muted-foreground">
          Contact our 24/7 safety team at{" "}
          <a href="mailto:safety@bunnydesires.com" className="text-primary hover:underline">
            safety@bunnydesires.com
          </a>
        </p>
      </section>
    </PageLayout>
  );
};

export default SafetyTipsPage;
