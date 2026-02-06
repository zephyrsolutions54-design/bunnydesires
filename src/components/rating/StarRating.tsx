import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  totalRatings,
  size = "md",
  showCount = true,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Star className={cn("text-bunny-gold fill-bunny-gold", sizeClasses[size])} />
      <span className={cn("font-medium text-bunny-gold", textSizes[size])}>
        {rating.toFixed(1)}
      </span>
      {showCount && totalRatings !== undefined && (
        <span className={cn("text-muted-foreground", textSizes[size])}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
}
