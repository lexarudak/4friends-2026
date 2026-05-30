import { NextResponse, after } from "next/server";
import { MatchService } from "@/services/match.service";
import { FixtureSyncService } from "@/services/fixture-sync.service";

export async function GET() {
	const payload = await MatchService.getNextMatchTimerPayload();

	after(async () => {
		const decision = await FixtureSyncService.ensureFresh();
		if (
			decision.kind !== "no-active-matches" &&
			decision.kind !== "fresh-cache"
		) {
			console.info("[next-match] sync decision", decision);
		}
	});

	return NextResponse.json(payload, {
		headers: { "Cache-Control": "no-store" },
	});
}
