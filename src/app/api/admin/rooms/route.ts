import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { RoomService } from "@/services/room.service";
import { COOKIES_KEYS, PAGES } from "@/utils/constants";

export async function GET() {
	const cookieStore = await cookies();
	const hasAccess =
		cookieStore.get(COOKIES_KEYS.ADMIN_ACCESS_PATH)?.value === PAGES.ADMIN;

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
