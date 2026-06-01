import { NextResponse, after } from "next/server";
import { MatchService } from "@/services/match.service";
import {
	FixtureSyncService,
	isPremiumWindow,
} from "@/services/fixture-sync.service";
import { getActiveRoomTournament } from "@/lib/active-room";

// CDN cache window for polled live data. Many viewers polling collapse into
// ~one origin hit per window per tournament, keeping DB (Prisma) requests flat
// regardless of audience size. Matched to the API sync cadence so we get ~one
// origin hit per sync: 120s during the 2-min premium window, 180s afterwards
// (5-min sync — DB stays cheap while live minute is still client-projected).
function cacheHeader(): string {
	const s = isPremiumWindow() ? 120 : 180;
	return `public, s-maxage=${s}, stale-while-revalidate=${s * 2}`;
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	const syncMode = url.searchParams.get("sync");
	const tParam = url.searchParams.get("t");

	// When `t` is provided we avoid reading the session cookie, which keeps the
	// response cacheable at the edge (cookie reads force a private response).
	const tournament = tParam ?? (await getActiveRoomTournament());

	if (syncMode === "wait") {
		const decision = await FixtureSyncService.ensureFresh();
		if (
			decision.kind !== "no-active-matches" &&
			decision.kind !== "fresh-cache"
		) {
			console.info("[next-match] sync (wait) decision", decision);
		}
	} else {
		after(async () => {
			const decision = await FixtureSyncService.ensureFresh();
			if (
				decision.kind !== "no-active-matches" &&
				decision.kind !== "fresh-cache"
			) {
				console.info("[next-match] sync decision", decision);
			}
		});
	}

	const payload = await MatchService.getNextMatchTimerPayload(tournament);

	// Don't cache the kickoff (sync=wait) call, nor the cookie-derived fallback.
	const cacheable = syncMode !== "wait" && tParam != null;
	return NextResponse.json(payload, {
		headers: { "Cache-Control": cacheable ? cacheHeader() : "no-store" },
	});
}
