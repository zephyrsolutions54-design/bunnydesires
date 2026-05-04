/**
 * Approximate INR per coin for display and for `transactions.amount` / withdrawal INR estimates.
 * Calibrated to mid-ladder packs (~₹0.47/coin average); 1 INR ≈ this many coins.
 */
export const COINS_PER_INR_ESTIMATE = 2.13;

/** Mid-band default when `current_earnings_rate` is missing (silver-aligned). */
export const DEFAULT_COINS_PER_MINUTE = 55;

export function coinsToApproxInr(coins: number): number {
  return coins / COINS_PER_INR_ESTIMATE;
}
