import { MatchService } from "@/services/match.service";
import { getActiveRoomTournament } from "@/lib/active-room";
import { NextResponse } from "next/server";

export async function GET() {
	const tournament = await getActiveRoomTournament();
	const matches = await MatchService.getMatches(tournament);
	return NextResponse.json(matches);
}
