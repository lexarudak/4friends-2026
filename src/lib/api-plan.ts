// Single source of truth for the api-football plan window and the daily
// request budget it implies. Lives here (not in football-api or fixture-sync)
// so both can import it without an import cycle.
//
// During the premium window we poll aggressively (2-minute TTL) and the Pro
// plan allows 7500 requests/day. Once it ends we fall back to the free plan's
// 100/day budget, so the caps drop accordingly — otherwise the aggressive
// polling would burn the free budget within hours and stop all syncing.

// Premium plan is active until the end of 2026-06-29 (UTC).
export const PREMIUM_UNTIL_MS = Date.UTC(2026, 5, 30); // 2026-06-30 00:00 UTC

export function isPremiumWindow(now: number = Date.now()): boolean {
	return now < PREMIUM_UNTIL_MS;
}

// Headroom is left under the real ceilings (100 free / 7500 Pro).
const FREE_SOFT_CAP = 95;
const FREE_HARD_CAP = 99;
const PREMIUM_SOFT_CAP = 7000;
const PREMIUM_HARD_CAP = 7400;

/** Stop *starting* new syncs at this count (leaves room for in-flight calls). */
export function getSoftCap(now: number = Date.now()): number {
	return isPremiumWindow(now) ? PREMIUM_SOFT_CAP : FREE_SOFT_CAP;
}

/** Hard ceiling — never exceed this many requests in a day. */
export function getHardCap(now: number = Date.now()): number {
	return isPremiumWindow(now) ? PREMIUM_HARD_CAP : FREE_HARD_CAP;
}
