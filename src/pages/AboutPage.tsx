import PageLayout from "@/components/landing/PageLayout";
import { Globe, Heart, Shield, DollarSign, Rocket } from "lucide-react";

const values = [
  { icon: Globe, title: "Global Community", desc: "We celebrate diversity and promote cross-cultural understanding across 50+ countries." },
  { icon: Heart, title: "Authenticity", desc: "We encourage genuine connections and authentic interactions between real people." },
  { icon: Shield, title: "Safety First", desc: "User safety and privacy are non-negotiable priorities baked into every feature." },
  { icon: DollarSign, title: "Fair Compensation", desc: "Creators deserve transparent, fair payment for their time and energy." },
  { icon: Rocket, title: "Innovation", desc: "We continuously improve with cutting-edge technology like real-time translation." },
];

const AboutPage = () => {
  return (
    <PageLayout title="About Bunny Desires">
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Our Mission</h2>
        <p className="text-muted-foreground text-lg">
          Breaking down language and distance barriers to create meaningful global connections through technology.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Our Story</h2>
        <p className="text-muted-foreground">
          Bunny Desires was founded in 2025 with a simple vision: enable people from different countries
          and cultures to connect authentically through HD video chat with real-time translation.
        </p>
        <p className="text-muted-foreground">
          In an increasingly connected world, language shouldn't be a barrier to human connection.
          We believe everyone deserves the opportunity to meet people from different cultures and
          backgrounds — and creators deserve to be fairly compensated for their time.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">Our Values</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="glass rounded-xl p-6 border border-border/30">
              <v.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">{v.title}</h3>
              <p className="text-muted-foreground text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Contact Us</h2>
        <p className="text-muted-foreground">
          Email:{" "}
          <a href="mailto:hello@bunnydesires.com" className="text-primary hover:underline">
            hello@bunnydesires.com
          </a>
          <br />
          Address: Mumbai, India
        </p>
      </section>
    </PageLayout>
  );
};

export default AboutPage;
