import { auth } from "@/auth";
import { getActiveRoomId } from "@/lib/active-room";
import { BetsLockedError, BetsService } from "@/services/bets.service";
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

	const bets = await BetsService.getBets(userId, roomId);
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

	try {
		const body: { bets: Bet[] } = await req.json();
		await BetsService.saveBets(userId, roomId, body.bets);
		return NextResponse.json({ ok: true });
	} catch (err) {
		if (err instanceof BetsLockedError) {
			return NextResponse.json(
				{
					error: API_ERROR_CODES.BETS_LOCKED,
					message: "This match has already started. Bets are locked.",
					matchIds: err.matchIds,
				},
				{ status: 409 }
			);
		}

		console.error("[POST /api/bets]", err);
		return NextResponse.json(
			{ error: "INVALID_REQUEST", message: "Could not save bets." },
			{ status: 400 }
		);
	}
}

// NOTE: The DELETE /api/bets endpoint was removed. It called
// BetsService.clearBets, which deleted ALL of a user's bets in a room —
// including finished matches — and caused real data loss. The "Clear" button
// now only resets the form client-side. Bets are removed/edited solely via the
// upsert path in POST. Do not reintroduce a bulk-delete endpoint without
// per-match lock protection (see saveBets / BetsLockedError).
