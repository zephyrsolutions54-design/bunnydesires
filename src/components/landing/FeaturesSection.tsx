import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Video, 
  Languages, 
  Gift, 
  Shield, 
  Globe2, 
  Wallet,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Video,
    title: "Crystal Clear Video",
    description: "HD quality video calls with adaptive streaming that works on any connection speed.",
    gradient: "from-pink-500/20 to-purple-500/20",
    iconBg: "from-pink-500 to-purple-500",
  },
  {
    icon: Languages,
    title: "Real-time Translation",
    description: "Break language barriers with instant message translation in 100+ languages.",
    gradient: "from-purple-500/20 to-indigo-500/20",
    iconBg: "from-purple-500 to-indigo-500",
  },
  {
    icon: Gift,
    title: "Virtual Gifts",
    description: "Send beautiful virtual gifts to show appreciation and support creators.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconBg: "from-rose-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description: "End-to-end encryption and strict moderation keep your conversations private.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconBg: "from-emerald-500 to-teal-500",
  },
  {
    icon: Globe2,
    title: "Global Community",
    description: "Connect with people from 100+ countries and discover new cultures.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "from-blue-500 to-cyan-500",
  },
  {
    icon: Wallet,
    title: "Easy Payments",
    description: "Secure coin system with multiple payment options including UPI and cards.",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconBg: "from-amber-500 to-orange-500",
  },
  {
    icon: MessageCircle,
    title: "Live Text Chat",
    description: "Chat alongside video calls with emoji, stickers, and photo sharing.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconBg: "from-violet-500 to-purple-500",
  },
  {
    icon: Star,
    title: "Rating System",
    description: "Find the best connections through community ratings and reviews.",
    gradient: "from-yellow-500/20 to-amber-500/20",
    iconBg: "from-yellow-500 to-amber-500",
  },
];

const FeaturesSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
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

        {/* Scroll Controls */}
        <div className="flex justify-end gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Horizontal Scrolling Features */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-[280px] md:w-[300px] snap-start"
            >
              <div className={`h-[380px] p-6 rounded-3xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-border/30 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden`}>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/40 to-transparent opacity-60" />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-xl mb-3 text-foreground">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.iconBg}`} />
                      <span className="text-xs text-muted-foreground">Learn more</span>
                    </div>
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-1.5">
            {features.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-primary/20"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;
