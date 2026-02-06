import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Search,
  Filter,
  MapPin,
  Star,
  Video,
  Gift,
  Wallet,
  Menu,
  X,
  Globe,
  Sparkles,
  Circle,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for creators
const mockCreators = [
  {
    id: 1,
    name: "Sofia",
    age: 24,
    country: "Brazil",
    countryCode: "BR",
    languages: ["Portuguese", "English"],
    rating: 4.9,
    reviews: 234,
    isOnline: true,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    bio: "Love making new friends from around the world! 🌍",
  },
  {
    id: 2,
    name: "Yuki",
    age: 22,
    country: "Japan",
    countryCode: "JP",
    languages: ["Japanese", "English"],
    rating: 4.8,
    reviews: 189,
    isOnline: true,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    bio: "Let's talk about anime and culture! ✨",
  },
  {
    id: 3,
    name: "Maria",
    age: 26,
    country: "Spain",
    countryCode: "ES",
    languages: ["Spanish", "English"],
    rating: 4.7,
    reviews: 156,
    isOnline: false,
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
    bio: "Passionate about travel and good conversations 🌸",
  },
  {
    id: 4,
    name: "Anna",
    age: 23,
    country: "Ukraine",
    countryCode: "UA",
    languages: ["Ukrainian", "Russian", "English"],
    rating: 4.9,
    reviews: 312,
    isOnline: true,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
    bio: "Artist and dreamer 🎨 Let's create memories!",
  },
  {
    id: 5,
    name: "Lisa",
    age: 25,
    country: "Germany",
    countryCode: "DE",
    languages: ["German", "English"],
    rating: 4.6,
    reviews: 98,
    isOnline: true,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
    bio: "Coffee lover ☕ Music enthusiast 🎵",
  },
  {
    id: 6,
    name: "Priya",
    age: 24,
    country: "India",
    countryCode: "IN",
    languages: ["Hindi", "English"],
    rating: 4.8,
    reviews: 167,
    isOnline: false,
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop",
    bio: "Dancer and bookworm 📚 Always up for fun chats!",
  },
];

const countries = ["All Countries", "Brazil", "Japan", "Spain", "Ukraine", "Germany", "India", "USA", "UK"];

const BrowsePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredCreators = mockCreators.filter((creator) => {
    const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "All Countries" || creator.country === selectedCountry;
    const matchesOnline = !showOnlineOnly || creator.isOnline;
    return matchesSearch && matchesCountry && matchesOnline;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary fill-primary" />
              <span className="font-display font-bold text-lg text-gradient hidden sm:inline">
                Bunny Desires
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl bg-muted/50 border-0"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Wallet */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-bunny-gold/10 border border-bunny-gold/20">
                <Wallet className="w-4 h-4 text-bunny-gold" />
                <span className="font-semibold text-bunny-gold">1,200</span>
              </div>

              {/* Buy Coins */}
              <Button variant="hero" size="sm" className="hidden sm:flex">
                <Sparkles className="w-4 h-4 mr-1" />
                Buy Coins
              </Button>

              {/* Mobile Filter Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              </Button>

              {/* Profile */}
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-foreground">JD</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-muted/50 border-0"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <motion.aside
            initial={false}
            animate={{
              width: isSidebarOpen ? "100%" : "auto",
              opacity: 1,
            }}
            className={`${
              isSidebarOpen
                ? "fixed inset-0 z-40 bg-background p-4 pt-20"
                : "hidden md:block md:w-64 flex-shrink-0"
            }`}
          >
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filters
              </h3>

              {/* Country Filter */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Country
                </label>
                <div className="space-y-2">
                  {countries.slice(0, 5).map((country) => (
                    <button
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCountry === country
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {country === "All Countries" ? (
                        <Globe className="w-4 h-4 inline mr-2" />
                      ) : null}
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Online Only</span>
                <button
                  onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    showOnlineOnly ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <motion.div
                    animate={{ x: showOnlineOnly ? 20 : 2 }}
                    className="w-5 h-5 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {isSidebarOpen && (
                <Button
                  variant="hero"
                  className="w-full mt-6"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Apply Filters
                </Button>
              )}
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold">
                  Discover Amazing People
                </h1>
                <p className="text-muted-foreground text-sm">
                  {filteredCreators.filter((c) => c.isOnline).length} online now
                </p>
              </div>
            </div>

            {/* Creators Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCreators.map((creator, index) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 hover:shadow-glow transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={creator.image}
                        alt={creator.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Online Badge */}
                      <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        creator.isOnline
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-muted/80 text-muted-foreground"
                      }`}>
                        <Circle className={`w-2 h-2 ${creator.isOnline ? "fill-green-400" : "fill-muted-foreground"}`} />
                        {creator.isOnline ? "Online" : "Offline"}
                      </div>

                      {/* Country Badge */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                        <MapPin className="w-3 h-3" />
                        {creator.country}
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Bottom Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <h3 className="font-display font-semibold text-lg text-white">
                              {creator.name}, {creator.age}
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{creator.rating}</span>
                              <span className="text-white/60 text-xs">({creator.reviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {creator.bio}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-4">
                        {creator.languages.slice(0, 2).map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="hero" 
                          className="flex-1"
                          disabled={!creator.isOnline}
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Video Chat
                        </Button>
                        <Button variant="outline" size="icon">
                          <Gift className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
