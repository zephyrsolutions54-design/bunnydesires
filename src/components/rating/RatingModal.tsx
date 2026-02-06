import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitRating } from "@/hooks/useRatings";
import { toast } from "sonner";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId: string;
  creatorName: string;
  creatorAvatar?: string | null;
  onRatingSubmitted?: () => void;
}

export function RatingModal({
  isOpen,
  onClose,
  callId,
  creatorName,
  creatorAvatar,
  onRatingSubmitted,
}: RatingModalProps) {
  const [selectedStars, setSelectedStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const { submitRating, isSubmitting } = useSubmitRating();

  const handleSubmit = async () => {
    if (selectedStars === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await submitRating(callId, selectedStars, feedback || undefined);
      
      if (selectedStars === 5) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      toast.success("Rating submitted successfully!");
      onRatingSubmitted?.();
      
      // Delay close to show confetti for 5-star
      setTimeout(() => {
        onClose();
      }, selectedStars === 5 ? 2000 : 500);
    } catch (error) {
      toast.error("Failed to submit rating. Please try again.");
    }
  };

  const displayStars = hoveredStars || selectedStars;

  const starLabels = ["", "Poor", "Fair", "Good", "Great", "Amazing!"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          {/* Confetti Effect for 5-star */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-[110]">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    y: -20,
                    x: Math.random() * window.innerWidth,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: 0,
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 720,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                  className="absolute text-2xl"
                >
                  {["⭐", "🌟", "✨", "💫"][Math.floor(Math.random() * 4)]}
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="gradient-primary p-6 pb-16 text-center">
              <h2 className="text-xl font-display font-bold text-white">
                Rate Your Experience
              </h2>
            </div>

            {/* Avatar - positioned to overlap header */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-card overflow-hidden bg-muted shadow-lg">
                {creatorAvatar ? (
                  <img
                    src={creatorAvatar}
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {creatorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-16 pb-6">
              <p className="text-center text-lg font-medium mb-2">
                How was your chat with
              </p>
              <p className="text-center text-xl font-display font-bold mb-6">
                {creatorName}?
              </p>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoveredStars(star)}
                    onMouseLeave={() => setHoveredStars(0)}
                    onClick={() => setSelectedStars(star)}
                    className="p-1 focus:outline-none"
                  >
                    <motion.div
                      animate={{
                        scale: displayStars >= star ? 1.1 : 1,
                      }}
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          displayStars >= star
                            ? "text-bunny-gold fill-bunny-gold"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </motion.div>
                  </motion.button>
                ))}
              </div>

              {/* Star Label */}
              <p className="text-center text-sm text-muted-foreground mb-6 h-5">
                {displayStars > 0 ? starLabels[displayStars] : "Tap to rate"}
              </p>

              {/* Feedback Input */}
              <div className="mb-6">
                <Textarea
                  placeholder="Share your experience (optional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="resize-none bg-muted/50 border-border/50 rounded-xl"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                variant="hero"
                className="w-full"
                onClick={handleSubmit}
                disabled={selectedStars === 0 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Rating"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your rating helps creators improve their service
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
