import { auth } from "@/auth";
import { getActiveRoomId } from "@/lib/active-room";
import { RoomStatisticService } from "@/services/room-statistic.service";
import { API_ERROR_CODES } from "@/utils/constants";
import { NextResponse } from "next/server";

export async function GET() {
	const session = await auth();

	if (!session?.user?.email) {
		console.info("[api:table] response", {
			status: 401,
			error: API_ERROR_CODES.UNAUTHORIZED,
		});
		return NextResponse.json(
			{ error: API_ERROR_CODES.UNAUTHORIZED },
			{ status: 401 }
		);
	}

	const roomId = await getActiveRoomId();
	if (!roomId) {
		console.info("[api:table] response", {
			status: 403,
			error: API_ERROR_CODES.NO_ACTIVE_ROOM,
			userId: session.user.email,
		});
		return NextResponse.json(
			{ error: API_ERROR_CODES.NO_ACTIVE_ROOM },
			{ status: 403 }
		);
	}

	const sections = await RoomStatisticService.getSections(
		roomId,
		session.user.email
	);
	const totalScore = sections.find(
		(section) => section.title === "Total Score"
	);

	console.info("[api:table] response", {
		status: 200,
		userId: session.user.email,
		roomId,
		rowsCount: totalScore?.rows?.length ?? 0,
	});

	return NextResponse.json({ rows: totalScore?.rows ?? [] });
}
