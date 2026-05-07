import { NextRequest, NextResponse } from "next/server";
import { hasAdminAccess } from "@/lib/admin-access";
import { RoomService } from "@/services/room.service";
import {
	getRoomNameLengthErrorMessage,
	isRoomNameLengthValid,
	normalizeRoomName,
} from "@/utils/room";

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
		const name = normalizeRoomName(payload?.name);

		if (!isRoomNameLengthValid(name)) {
			return NextResponse.json(
				{
					error: "INVALID_ROOM_NAME",
					message: getRoomNameLengthErrorMessage(),
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
