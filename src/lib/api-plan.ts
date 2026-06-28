// Single source of truth for the api-football daily request budget and polling
// cadence. Lives here (not in football-api or fixture-sync) so both can import
// it without an import cycle.
//
// The project runs on the paid (Pro) plan permanently: we poll aggressively
// (2-minute TTL) and budget against the Pro plan's 7500 requests/day. The
// previous time-boxed downgrade to the free plan's 100/day budget has been
// removed — the plan no longer expires.

// Retained because callers gate polling cadence + CDN cache windows on it; the
// plan is permanent, so it is always true.
export function isPremiumWindow(): boolean {
	return true;
}

// Headroom is left under the real 7500/day Pro ceiling.
const SOFT_CAP = 7000;
const HARD_CAP = 7400;

/** Stop *starting* new syncs at this count (leaves room for in-flight calls). */
export function getSoftCap(): number {
	return SOFT_CAP;
}

/** Hard ceiling — never exceed this many requests in a day. */
export function getHardCap(): number {
	return HARD_CAP;
}
