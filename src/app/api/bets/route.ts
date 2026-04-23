import { auth } from "@/auth";
import { getActiveRoomId } from "@/lib/active-room";
import { BetsService } from "@/services/bets.service";
import { API_ERROR_CODES } from "@/utils/constants";
import { NextResponse } from "next/server";
import type { Bet } from "@/types/api";

export async function GET() {
	const session = await auth();
	const userId = session?.user?.email;

	if (!userId) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.UNAUTHORIZED },
			{ status: 401 }
		);
	}

	const roomId = await getActiveRoomId();
	if (!roomId) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.NO_ACTIVE_ROOM },
			{ status: 403 }
		);
	}

	const bets = BetsService.getBets(userId, roomId);
	return NextResponse.json(bets);
}

export async function POST(req: Request) {
	const session = await auth();
	const userId = session?.user?.email;

	if (!userId) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.UNAUTHORIZED },
			{ status: 401 }
		);
	}

	const roomId = await getActiveRoomId();
	if (!roomId) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.NO_ACTIVE_ROOM },
			{ status: 403 }
		);
	}

	const body: { bets: Bet[] } = await req.json();
	BetsService.saveBets(userId, roomId, body.bets);
	return NextResponse.json({ ok: true });
}

export async function DELETE() {
	const session = await auth();
	const userId = session?.user?.email;

	if (!userId) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.UNAUTHORIZED },
			{ status: 401 }
		);
	}

	const roomId = await getActiveRoomId();
	if (!roomId) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.NO_ACTIVE_ROOM },
			{ status: 403 }
		);
	}

	BetsService.clearBets(userId, roomId);
	return NextResponse.json({ ok: true });
}
