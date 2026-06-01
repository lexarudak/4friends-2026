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
			tournament: room.tournament,
			password: room.password ?? null,
			imageUrl: room.imageUrl ?? null,
		}))
	);
}

export async function POST(request: NextRequest) {
	const hasAccess = await hasAdminAccess();

	if (!hasAccess) {
		return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
	}

	try {
		const payload = (await request.json()) as {
			name?: unknown;
			tournament?: unknown;
			password?: unknown;
			imageUrl?: unknown;
		};
		const name = normalizeRoomName(payload?.name);
		const tournament =
			typeof payload.tournament === "string" && payload.tournament.trim()
				? payload.tournament.trim()
				: "wc2026";

		const rawPassword =
			typeof payload.password === "string" ? payload.password.trim() : "";
		if (rawPassword && rawPassword.length <= 4) {
			return NextResponse.json(
				{ error: "INVALID_PASSWORD", message: "Password must be longer than 4 characters." },
				{ status: 400 }
			);
		}
		const password = rawPassword || undefined;

		// Optional room image: a small base64 data URL (resized client-side).
		let imageUrl: string | undefined;
		if (typeof payload.imageUrl === "string" && payload.imageUrl) {
			if (!/^data:image\/(png|jpeg|webp);base64,/.test(payload.imageUrl)) {
				return NextResponse.json(
					{ error: "INVALID_IMAGE", message: "Unsupported image format." },
					{ status: 400 }
				);
			}
			if (payload.imageUrl.length > 300_000) {
				return NextResponse.json(
					{ error: "IMAGE_TOO_LARGE", message: "Image is too large." },
					{ status: 400 }
				);
			}
			imageUrl = payload.imageUrl;
		}

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

		const room = await RoomService.createRoom(
			name,
			tournament,
			password,
			imageUrl
		);

		return NextResponse.json(
			{
				id: room.id,
				name: room.name,
				tournament: room.tournament,
				password: room.password ?? null,
				imageUrl: room.imageUrl ?? null,
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error("[POST /api/admin/rooms]", err);
		return NextResponse.json(
			{ error: "INVALID_REQUEST", message: "Could not create room." },
			{ status: 400 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	const hasAccess = await hasAdminAccess();

	if (!hasAccess) {
		return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
	}

	try {
		const payload = (await request.json()) as { name?: unknown };
		const name = typeof payload.name === "string" ? payload.name.trim() : "";

		if (!name) {
			return NextResponse.json(
				{ error: "INVALID_REQUEST", message: "Room name is required." },
				{ status: 400 }
			);
		}

		const deleted = await RoomService.deleteRoom(name);
		if (!deleted) {
			return NextResponse.json(
				{ error: "ROOM_NOT_FOUND", message: "Room not found." },
				{ status: 404 }
			);
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("[DELETE /api/admin/rooms]", err);
		return NextResponse.json(
			{ error: "INVALID_REQUEST", message: "Could not delete room." },
			{ status: 400 }
		);
	}
}
