import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles, Users, Globe, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    icon: Users,
    title: "Active Community",
    description: "Join thousands of users connecting daily.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconBg: "from-pink-500 to-rose-500",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with people from 100+ countries.",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconBg: "from-purple-500 to-violet-500",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description: "Your privacy is our top priority.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Instant Connect",
    description: "Start chatting in under 60 seconds.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "from-amber-500 to-orange-500",
  },
];

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      
      {/* Floating Hearts */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/10"
          style={{
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            delay: i * 0.7,
          }}
        >
          <Heart className="w-10 h-10 fill-current" />
        </motion.div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Join thousands of happy users
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Make{" "}
            <span className="text-gradient">Real Connections?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join Bunny Desires today and start video chatting with amazing people 
            from around the world. Your next great conversation is just a click away.
          </p>
        </motion.div>

        {/* Benefits Flashcards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`h-[280px] p-6 rounded-3xl bg-gradient-to-br ${benefit.gradient} backdrop-blur-sm border border-border/30 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden`}>
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/60 to-transparent" />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center text-center">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.iconBg} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg mb-3 text-foreground">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Hover Glow */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-primary/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="group">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero-outline" size="xl">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free to join • Start chatting in minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
