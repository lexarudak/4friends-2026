import { MatchService } from "@/services/match.service";
import { NextResponse } from "next/server";

export async function GET() {
	const matches = MatchService.getMatches();
	return NextResponse.json(matches);
}
