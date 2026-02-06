import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, AlertTriangle, FileCheck } from "lucide-react";

const safetyFeatures = [
  {
    icon: Shield,
    title: "End-to-End Encryption",
    description: "All video calls and messages are encrypted to protect your privacy.",
  },
  {
    icon: UserCheck,
    title: "Age Verification",
    description: "Strict 18+ verification ensures a safe adult community.",
  },
  {
    icon: Eye,
    title: "24/7 Moderation",
    description: "Our team monitors the platform round the clock for safety.",
  },
  {
    icon: AlertTriangle,
    title: "Report & Block",
    description: "Easily report inappropriate behavior and block unwanted users.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "PCI DSS compliant payment processing for your financial safety.",
  },
  {
    icon: FileCheck,
    title: "Privacy Compliant",
    description: "Fully compliant with IT Act 2000 and data protection standards.",
  },
];

const SafetySection = () => {
  return (
    <section id="safety" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Your Safety Matters
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
              A Safe Space for{" "}
              <span className="text-gradient">Meaningful Connections</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We've built Bunny Desires with safety at its core. From encrypted 
              communications to strict moderation, we ensure you can connect 
              with confidence.
            </p>

            {/* Safety Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "< 1hr", label: "Response Time" },
                { value: "0", label: "Data Breaches" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="font-display text-2xl font-bold text-gradient">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
