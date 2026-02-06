import { motion } from "framer-motion";
import { UserPlus, Search, Video, Heart } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Create Your Profile",
    description: "Sign up in seconds and create your profile with photos and interests.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconBg: "from-pink-500 to-rose-500",
    accentColor: "pink",
  },
  {
    icon: Search,
    number: "02",
    title: "Browse & Discover",
    description: "Explore profiles from around the world and find people who interest you.",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconBg: "from-purple-500 to-violet-500",
    accentColor: "purple",
  },
  {
    icon: Video,
    number: "03",
    title: "Start Video Chat",
    description: "Connect instantly with HD video calls and real-time translation.",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconBg: "from-indigo-500 to-blue-500",
    accentColor: "indigo",
  },
  {
    icon: Heart,
    number: "04",
    title: "Build Connections",
    description: "Send gifts, rate experiences, and build meaningful relationships.",
    gradient: "from-rose-500/20 to-primary/20",
    iconBg: "from-rose-500 to-primary",
    accentColor: "rose",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-background">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-card/50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Start Connecting in{" "}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Getting started is easy. Within minutes, you'll be having amazing 
            conversations with people from around the world.
          </p>
        </motion.div>

        {/* Steps Grid - Vertical Flashcards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className={`h-[400px] p-6 rounded-3xl bg-gradient-to-br ${step.gradient} backdrop-blur-sm border border-border/30 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden`}>
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/50 to-transparent" />
                
                {/* Top Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-20" />
                )}

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center text-center">
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-gradient">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.iconBg} flex items-center justify-center mb-6 shadow-lg shadow-primary/20`}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-xl mb-4 text-foreground">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                    {step.description}
                  </p>

                  {/* Bottom Decorative */}
                  <div className="mt-auto pt-6 w-full">
                    <div className={`h-1 rounded-full bg-gradient-to-r ${step.iconBg} opacity-50`} />
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-primary/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
