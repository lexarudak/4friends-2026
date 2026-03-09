import { auth } from "@/auth";
import { RoomService } from "@/services/room.service";
import { COOKIES_KEYS } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";

async function getSession() {
	const session = await auth();
	if (!session?.user?.email) return null;
	return session;
}

// GET /api/rooms — get current user's room list
export async function GET() {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const rooms = await RoomService.getUserRooms(session.user!.email!);
	return NextResponse.json(rooms);
}

// POST /api/rooms — join a room (room_id from cookie or body)
export async function POST(req: NextRequest) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const roomId = req.cookies.get(COOKIES_KEYS.ROOM_ID)?.value;
	if (!roomId) {
		return NextResponse.json(
			{ error: "room_id cookie is required" },
			{ status: 400 },
		);
	}

	const rooms = await RoomService.joinRoom(session.user!.email!, roomId);
	return NextResponse.json(rooms);
}
