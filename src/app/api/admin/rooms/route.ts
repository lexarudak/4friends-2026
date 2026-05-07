import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { RoomService } from "@/services/room.service";
import { COOKIES_KEYS, PAGES } from "@/utils/constants";

const ROOM_NAME_MIN_LENGTH = 3;
const ROOM_NAME_MAX_LENGTH = 15;

async function hasAdminAccess() {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIES_KEYS.ADMIN_ACCESS_PATH)?.value === PAGES.ADMIN;
}

export async function GET() {
	const hasAccess = await hasAdminAccess();

	if (!hasAccess) {
		return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
	}

	const rooms = await RoomService.getAllRooms();

	return NextResponse.json(
		rooms.map((room) => ({
			id: room.id,
			name: room.name,
		}))
	);
}

export async function POST(request: NextRequest) {
	const hasAccess = await hasAdminAccess();

	if (!hasAccess) {
		return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
	}

	try {
		const payload = (await request.json()) as { name?: unknown };
		const name = typeof payload?.name === "string" ? payload.name.trim() : "";

		if (
			name.length < ROOM_NAME_MIN_LENGTH ||
			name.length > ROOM_NAME_MAX_LENGTH
		) {
			return NextResponse.json(
				{
					error: "INVALID_ROOM_NAME",
					message: `Room name should be between ${ROOM_NAME_MIN_LENGTH} and ${ROOM_NAME_MAX_LENGTH} characters.`,
				},
				{ status: 400 }
			);
		}

		const existingRoom = await RoomService.getRoomByName(name);

		if (existingRoom) {
			return NextResponse.json(
				{
					error: "ROOM_ALREADY_EXISTS",
					message: "Room with this name already exists.",
				},
				{ status: 409 }
			);
		}

		const room = await RoomService.createRoom(name);

		return NextResponse.json({ id: room.id, name: room.name }, { status: 201 });
	} catch (err) {
		console.error("[POST /api/admin/rooms]", err);
		return NextResponse.json(
			{ error: "INVALID_REQUEST", message: "Could not create room." },
			{ status: 400 }
		);
	}
}
