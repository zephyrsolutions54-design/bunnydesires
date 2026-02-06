import { motion } from "framer-motion";
import { Star, TrendingUp, Trophy, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRatings, getTierInfo, getNextTierProgress } from "@/hooks/useRatings";
import { formatDistanceToNow } from "date-fns";

interface RatingDashboardProps {
  userId: string;
}

export function RatingDashboard({ userId }: RatingDashboardProps) {
  const { ratings, stats, loading } = useRatings(userId);

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const tierInfo = getTierInfo(stats.ratingTier);
  const nextTierProgress = getNextTierProgress(stats.averageRating, stats.totalRatings);
  const breakdown = stats.ratingBreakdown;
  const totalRatings = stats.totalRatings || 1; // Prevent division by zero

  // Calculate percentages for each star level
  const starPercentages = {
    five: (breakdown.five_stars / totalRatings) * 100,
    four: (breakdown.four_stars / totalRatings) * 100,
    three: (breakdown.three_stars / totalRatings) * 100,
    two: (breakdown.two_stars / totalRatings) * 100,
    one: (breakdown.one_star / totalRatings) * 100,
  };

  // Calculate earnings per hour (6 coins = ₹1, 60 minutes)
  const earningsPerHour = (stats.currentEarningsRate * 60) / 6;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-bunny-gold fill-bunny-gold" />
          Your Rating Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-muted/50 border border-border/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</span>
                <Star className="w-6 h-6 text-bunny-gold fill-bunny-gold" />
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.totalRatings} total ratings
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${tierInfo.bgColor}`}>
              <span className="text-lg">{tierInfo.icon}</span>
              <span className={`font-semibold text-sm ${tierInfo.color}`}>
                {tierInfo.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-bunny-gold" />
              <span className="text-sm">
                <span className="font-semibold">{stats.currentEarningsRate}</span> coins/min
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              ₹{earningsPerHour.toFixed(0)}/hr
            </div>
          </div>
        </motion.div>

        {/* Progress to Next Tier */}
        {nextTierProgress.nextTier && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Progress to Next Tier</span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">
                Next:{" "}
                <span className="font-semibold">
                  {getTierInfo(nextTierProgress.nextTier.name).icon}{" "}
                  {nextTierProgress.nextTier.name.toUpperCase()}
                </span>{" "}
                ({nextTierProgress.nextTier.minRating}⭐)
              </span>
              <span className="text-xs text-muted-foreground">
                {nextTierProgress.nextTier.coinsPerMin} coins/min
              </span>
            </div>

            <Progress value={nextTierProgress.progress} className="h-3 mb-2" />

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {nextTierProgress.message}
            </p>
          </motion.div>
        )}

        {/* Rating Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-semibold text-sm mb-4">Rating Breakdown</h4>
          <div className="space-y-3">
            {[
              { stars: 5, count: breakdown.five_stars, percent: starPercentages.five },
              { stars: 4, count: breakdown.four_stars, percent: starPercentages.four },
              { stars: 3, count: breakdown.three_stars, percent: starPercentages.three },
              { stars: 2, count: breakdown.two_stars, percent: starPercentages.two },
              { stars: 1, count: breakdown.one_star, percent: starPercentages.one },
            ].map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{item.stars}</span>
                  <Star className="w-3.5 h-3.5 text-bunny-gold fill-bunny-gold" />
                </div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ delay: 0.3 + item.stars * 0.05, duration: 0.5 }}
                    className={`h-full ${
                      item.stars >= 4
                        ? "bg-green-500"
                        : item.stars === 3
                        ? "bg-yellow-500"
                        : "bg-red-400"
                    }`}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {item.percent.toFixed(0)}% ({item.count})
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Ratings */}
        {ratings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-sm mb-4">Recent Ratings</h4>
            <div className="space-y-3">
              {ratings.slice(0, 5).map((rating) => (
                <div
                  key={rating.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/30"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rating.stars
                            ? "text-bunny-gold fill-bunny-gold"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    {rating.feedback && (
                      <p className="text-sm text-foreground truncate">
                        "{rating.feedback}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {ratings.length === 0 && stats.totalRatings === 0 && (
          <div className="text-center py-6">
            <Star className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No ratings yet</p>
            <p className="text-sm text-muted-foreground">
              Complete video calls to receive ratings!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
