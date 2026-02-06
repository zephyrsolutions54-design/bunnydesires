import { motion } from "framer-motion";
import { 
  Video, 
  Languages, 
  Gift, 
  Shield, 
  Globe2, 
  Wallet,
  MessageCircle,
  Star
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Crystal Clear Video",
    description: "HD quality video calls with adaptive streaming that works on any connection speed.",
  },
  {
    icon: Languages,
    title: "Real-time Translation",
    description: "Break language barriers with instant message translation in 100+ languages.",
  },
  {
    icon: Gift,
    title: "Virtual Gifts",
    description: "Send beautiful virtual gifts to show appreciation and support creators.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "End-to-end encryption and strict moderation keep your conversations private.",
  },
  {
    icon: Globe2,
    title: "Global Community",
    description: "Connect with people from 100+ countries and discover new cultures.",
  },
  {
    icon: Wallet,
    title: "Easy Payments",
    description: "Secure coin system with multiple payment options including UPI and cards.",
  },
  {
    icon: MessageCircle,
    title: "Live Text Chat",
    description: "Chat alongside video calls with emoji, stickers, and photo sharing.",
  },
  {
    icon: Star,
    title: "Rating System",
    description: "Find the best connections through community ratings and reviews.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Everything You Need for{" "}
            <span className="text-gradient">Amazing Connections</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our platform is packed with features designed to make your video chat 
            experience seamless, safe, and enjoyable.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
