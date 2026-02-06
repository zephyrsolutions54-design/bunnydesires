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
  X,
  Globe,
  Sparkles,
  Circle,
  LogOut,
  Loader2,
  Coins,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreators } from "@/hooks/useCreators";
import { TierBadge } from "@/components/rating/TierBadge";
import { StarRating } from "@/components/rating/StarRating";

const countries = ["All Countries", "India", "Brazil", "Japan", "Spain", "Ukraine", "Germany", "USA", "UK"];

// Placeholder images for creators without avatars
const placeholderImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop",
];

const getPlaceholderImage = (index: number) => {
  return placeholderImages[index % placeholderImages.length];
};

const BrowsePage = () => {
  const navigate = useNavigate();
  const { user, profile, wallet, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { creators, loading } = useCreators({
    country: selectedCountry,
    onlineOnly: showOnlineOnly,
    searchQuery,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const onlineCount = creators.filter((c) => c.is_online).length;

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
              {/* Wallet - only show for male users */}
              {profile?.gender === "male" && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-bunny-gold/10 border border-bunny-gold/20">
                  <Wallet className="w-4 h-4 text-bunny-gold" />
                  <span className="font-semibold text-bunny-gold">
                    {wallet?.balance?.toLocaleString() || 0}
                  </span>
                </div>
              )}

              {/* Buy Coins - only show for male users */}
              {profile?.gender === "male" && (
                <Button variant="hero" size="sm" className="hidden sm:flex">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Buy Coins
                </Button>
              )}

              {/* Mobile Filter Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              </Button>

              {/* Sign Out */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </Button>

              {/* Profile */}
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-primary-foreground">
                      {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
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
                  {onlineCount} online now
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Empty State */}
            {!loading && creators.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No creators found matching your filters.</p>
              </div>
            )}

            {/* Creators Grid */}
            {!loading && creators.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {creators.map((creator, index) => (
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
                          src={creator.avatar_url || getPlaceholderImage(index)}
                          alt={creator.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Online Badge */}
                        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          creator.is_online
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-muted/80 text-muted-foreground"
                        }`}>
                          <Circle className={`w-2 h-2 ${creator.is_online ? "fill-green-400" : "fill-muted-foreground"}`} />
                          {creator.is_online ? "Online" : "Offline"}
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
                                {creator.name}
                              </h3>
                              <StarRating
                                rating={Number(creator.rating)}
                                totalRatings={creator.total_ratings}
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-bunny-gold text-xs font-medium">
                              <Coins className="w-3 h-3" />
                              {creator.current_earnings_rate || 6}/min
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {creator.bio || "Ready to chat! 💬"}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {creator.language}
                          </Badge>
                          {creator.is_verified && (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              Verified
                            </Badge>
                          )}
                          <TierBadge tier={creator.rating_tier || "standard"} size="sm" />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="hero" 
                            className="flex-1"
                            disabled={!creator.is_online}
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
