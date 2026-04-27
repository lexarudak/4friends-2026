import { auth } from "@/auth";
import { getActiveRoomId } from "@/lib/active-room";
import { TableService } from "@/services/table.service";
import { API_ERROR_CODES } from "@/utils/constants";
import { NextResponse } from "next/server";

export async function GET() {
	const session = await auth();

	if (!session?.user?.email) {
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

	const table = await TableService.getTopTable(roomId, "", "", 100);
	return NextResponse.json(table);
}
