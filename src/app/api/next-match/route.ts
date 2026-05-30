import { NextResponse, after } from "next/server";
import { MatchService } from "@/services/match.service";
import { FixtureSyncService } from "@/services/fixture-sync.service";
import { getActiveRoomTournament } from "@/lib/active-room";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const syncMode = url.searchParams.get("sync");

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

	const tournament = await getActiveRoomTournament();
	const payload = await MatchService.getNextMatchTimerPayload(tournament);

	return NextResponse.json(payload, {
		headers: { "Cache-Control": "no-store" },
	});
}
