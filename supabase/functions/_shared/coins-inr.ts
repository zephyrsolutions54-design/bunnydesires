/** Same as `src/constants/economy.ts` — keep in sync. */
export const COINS_PER_INR_ESTIMATE = 2.13;

/** Mid-band default when `coins_per_minute` / `current_earnings_rate` is missing. */
export const DEFAULT_COINS_PER_MINUTE = 55;

export function coinsToApproxInrAmount(coins: number): number {
  return Math.round((coins / COINS_PER_INR_ESTIMATE) * 100) / 100;
}
