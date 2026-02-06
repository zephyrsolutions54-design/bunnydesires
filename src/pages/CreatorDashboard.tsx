import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  Wallet,
  TrendingUp,
  Clock,
  Gift,
  Video,
  DollarSign,
  LogOut,
  User,
  Settings,
  Circle,
  ArrowUpRight,
  Loader2,
  Coins,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RatingDashboard } from "@/components/rating/RatingDashboard";
import { TierBadge } from "@/components/rating/TierBadge";

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const { profile, earnings, signOut, refreshProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(profile?.is_online || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleOnline = async () => {
    if (!profile) return;
    
    setIsUpdating(true);
    const newStatus = !isOnline;
    
    const { error } = await supabase
      .from("profiles")
      .update({ is_online: newStatus })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      setIsOnline(newStatus);
      toast.success(newStatus ? "You're now online!" : "You're now offline");
      await refreshProfile();
    }
    
    setIsUpdating(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Calculate earnings in INR (6 coins = ₹1)
  const totalEarningsINR = earnings ? (earnings.total_earnings / 6).toFixed(2) : "0.00";
  const availableBalanceINR = earnings ? (earnings.available_balance / 6).toFixed(2) : "0.00";
  const callEarningsINR = earnings ? (earnings.call_earnings / 6).toFixed(2) : "0.00";
  const giftEarningsINR = earnings ? (earnings.gift_earnings / 6).toFixed(2) : "0.00";

  const stats = [
    {
      title: "Total Earnings",
      value: `₹${totalEarningsINR}`,
      subValue: `${earnings?.total_earnings || 0} coins`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Available Balance",
      value: `₹${availableBalanceINR}`,
      subValue: `${earnings?.available_balance || 0} coins`,
      icon: Wallet,
      color: "text-bunny-gold",
      bgColor: "bg-bunny-gold/10",
    },
    {
      title: "Call Earnings",
      value: `₹${callEarningsINR}`,
      subValue: `${earnings?.call_earnings || 0} coins`,
      icon: Video,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Gift Earnings",
      value: `₹${giftEarningsINR}`,
      subValue: `${earnings?.gift_earnings || 0} coins`,
      icon: Gift,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-primary fill-primary" />
              <span className="font-display font-bold text-lg text-gradient">
                Bunny Desires
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Online Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {isOnline ? "Online" : "Offline"}
                </span>
                <button
                  onClick={handleToggleOnline}
                  disabled={isUpdating}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isOnline ? "bg-green-500" : "bg-muted-foreground/30"
                  }`}
                >
                  <motion.div
                    animate={{ x: isOnline ? 28 : 4 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Circle className={`w-2 h-2 ${isOnline ? "fill-green-500" : "fill-muted-foreground"}`} />
                    )}
                  </motion.div>
                </button>
              </div>

              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>

              <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-primary-foreground">
                    {profile?.name?.charAt(0)?.toUpperCase() || "C"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-3xl font-bold">
              Welcome back, {profile?.name || "Creator"}! 👋
            </h1>
            <TierBadge tier={profile?.rating_tier || "standard"} size="lg" />
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Here's an overview of your earnings and activity.</span>
            <div className="flex items-center gap-1 text-bunny-gold">
              <Coins className="w-4 h-4" />
              <span className="font-medium">{profile?.current_earnings_rate || 6} coins/min</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Withdrawal Card */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Withdraw Earnings
              </CardTitle>
              <CardDescription>
                Minimum withdrawal: ₹500 (3,000 coins)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Available to withdraw</p>
                  <p className="text-2xl font-bold text-green-500">₹{availableBalanceINR}</p>
                </div>
                <Button 
                  variant="hero" 
                  className="w-full"
                  disabled={!earnings || earnings.available_balance < 3000}
                >
                  Request Withdrawal
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
                {earnings && earnings.available_balance < 3000 && (
                  <p className="text-xs text-muted-foreground text-center">
                    You need at least 3,000 coins (₹500) to withdraw
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Update your profile to attract more connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{profile?.name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Dashboard */}
        {profile && (
          <div className="mb-8">
            <RatingDashboard userId={profile.id} />
          </div>
        )}

        {/* Recent Activity Placeholder */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-sm text-muted-foreground">
                Go online to start receiving video chat requests!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatorDashboard;
