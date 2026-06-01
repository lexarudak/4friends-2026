export type LiveStatus =
	| "1H"
	| "HT"
	| "2H"
	| "ET"
	| "BT"
	| "P"
	| "LIVE"
	| "INT";

const LIVE_STATUS_SET = new Set<LiveStatus>([
	"1H",
	"HT",
	"2H",
	"ET",
	"BT",
	"P",
	"LIVE",
	"INT",
]);

export function isLiveStatus(statusShort: string): statusShort is LiveStatus {
	return LIVE_STATUS_SET.has(statusShort as LiveStatus);
}

const REGULATION_END = 90;
const FIRST_HALF_END = 45;
const ET_END = 120;

// Cap how far the client may project forward from the last sync. Tuned to the
// ~2-min sync cadence so the minute keeps ticking smoothly between syncs, while
// still bounding over-projection across breaks (HT/BT) where the match clock is
// paused but wall-clock keeps running.
const MAX_PROJECTION_MIN = 3;

/**
 * Compute display string for current live minute based on:
 * - statusShort (what kind of phase the match is in)
 * - elapsed (server-reported minute, can be null)
 * - lastSyncAtMs (when server fetched data from API)
 * - nowMs (current client time, defaults to Date.now())
 *
 * Behavior:
 * - 1H/2H/ET: increment by minutes since last sync, cap at phase boundary then show "X+"
 * - HT/BT/P/INT: show phase label, never increment
 * - LIVE without elapsed: show "LIVE"
 */
export function computeLiveMinute(
	statusShort: string,
	elapsed: number | null,
	lastSyncAtMs: number | null,
	nowMs: number = Date.now()
): string {
	if (!isLiveStatus(statusShort)) return "";

	if (statusShort === "HT") return "HT";
	if (statusShort === "BT") return "BT";
	if (statusShort === "P") return "PEN";
	if (statusShort === "INT") return "INT";

	if (elapsed == null) return "LIVE";

	const minutesSinceSync =
		lastSyncAtMs != null
			? Math.min(
					MAX_PROJECTION_MIN,
					Math.max(0, Math.floor((nowMs - lastSyncAtMs) / 60_000))
				)
			: 0;
	const projected = elapsed + minutesSinceSync;

	if (statusShort === "1H") {
		if (projected >= FIRST_HALF_END) return `${FIRST_HALF_END}+'`;
		return `${projected}'`;
	}
	if (statusShort === "2H") {
		if (projected >= REGULATION_END) return `${REGULATION_END}+'`;
		return `${projected}'`;
	}
	if (statusShort === "ET") {
		if (projected >= ET_END) return `${ET_END}+'`;
		return `${projected}'`;
	}

	return `${projected}'`;
}
