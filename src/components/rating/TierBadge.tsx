import { cn } from "@/lib/utils";
import { getTierInfo } from "@/hooks/useRatings";

interface TierBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", showLabel = true, className }: TierBadgeProps) {
  const tierInfo = getTierInfo(tier);

  if (tier === "standard" || !tierInfo.icon) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        tierInfo.bgColor,
        sizeClasses[size],
        className
      )}
    >
      <span className={iconSizes[size]}>{tierInfo.icon}</span>
      {showLabel && (
        <span className={tierInfo.color}>{tierInfo.label} RATED</span>
      )}
    </div>
  );
}
