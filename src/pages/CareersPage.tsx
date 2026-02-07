import PageLayout from "@/components/landing/PageLayout";
import { Briefcase } from "lucide-react";

const CareersPage = () => {
  return (
    <PageLayout title="Careers at Bunny Desires">
      <p className="text-muted-foreground text-lg">
        Join our team and help connect people across the world through technology.
      </p>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Why Work With Us?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: "Remote-First", desc: "Work from anywhere in India or globally." },
            { title: "Impactful Work", desc: "Help millions connect across language barriers." },
            { title: "Growth", desc: "Fast-growing startup with plenty of learning opportunities." },
            { title: "Competitive Pay", desc: "Market-rate salary with equity options." },
          ].map((p) => (
            <div key={p.title} className="glass rounded-xl p-6 border border-border/30">
              <h3 className="font-semibold mb-1">{p.title}</h3>
              <p className="text-muted-foreground text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Open Positions</h2>
        <div className="glass rounded-xl p-8 border border-border/30 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No open positions at the moment. Check back soon or email your resume to{" "}
            <a href="mailto:careers@bunnydesires.com" className="text-primary hover:underline">
              careers@bunnydesires.com
            </a>
          </p>
        </div>
      </section>
    </PageLayout>
  );
};

export default CareersPage;
