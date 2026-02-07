import PageLayout from "@/components/landing/PageLayout";

const DMCAPage = () => {
  return (
    <PageLayout title="DMCA Copyright Policy" lastUpdated="February 2026">
      <section className="space-y-4">
        <p className="text-muted-foreground text-lg">
          Bunny Desires respects intellectual property rights and expects our users to do the same.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Reporting Copyright Infringement</h2>
        <p className="text-muted-foreground">
          If you believe your copyrighted work has been used on our platform without permission, please send a written notice to{" "}
          <a href="mailto:dmca@bunnydesires.com" className="text-primary hover:underline">
            dmca@bunnydesires.com
          </a>{" "}
          containing:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li>Your contact information (name, address, phone number, email)</li>
          <li>Description of the copyrighted work you claim has been infringed</li>
          <li>URL or location of the infringing content on our platform</li>
          <li>A statement that you have a good faith belief that the use is not authorized</li>
          <li>A statement that the information in the notice is accurate, under penalty of perjury</li>
          <li>Your physical or electronic signature</li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Response Time</h2>
        <p className="text-muted-foreground">
          We will investigate valid reports within 48 hours and remove confirmed infringing content promptly.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Counter-Notice</h2>
        <p className="text-muted-foreground">
          If you believe your content was wrongly removed, you may submit a counter-notice to{" "}
          <a href="mailto:dmca@bunnydesires.com" className="text-primary hover:underline">
            dmca@bunnydesires.com
          </a>{" "}
          including your contact information, identification of the removed content, a statement under
          penalty of perjury that you believe the removal was a mistake, and your consent to local
          court jurisdiction.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Repeat Infringers</h2>
        <p className="text-muted-foreground">
          Accounts with multiple valid copyright complaints will be permanently terminated.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Designated DMCA Agent</h2>
        <p className="text-muted-foreground">
          Email:{" "}
          <a href="mailto:dmca@bunnydesires.com" className="text-primary hover:underline">
            dmca@bunnydesires.com
          </a>
          <br />
          Address: Mumbai, India
        </p>
      </section>
    </PageLayout>
  );
};

export default DMCAPage;
