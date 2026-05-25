import { NextResponse } from "next/server";
import { MatchService } from "@/services/match.service";

export async function GET() {
	const payload = await MatchService.getNextMatchTimerPayload();

	return NextResponse.json(payload, {
		headers: {
			"Cache-Control": "no-store",
		},
	});
}
