import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Deduped per request: multiple server components on one page resolve the
// active room / tournament once instead of repeating auth() + room.findUnique.
export const getActiveRoomId = cache(async (): Promise<string | null> => {
	const session = await auth();
	return (
		(session?.user as { current_room?: string | null })?.current_room ?? null
	);
});

export const getActiveRoomTournament = cache(async (): Promise<string> => {
	const roomId = await getActiveRoomId();
	if (!roomId) return "wc2026";
	const room = await prisma.room.findUnique({
		where: { name: roomId },
		select: { tournament: true },
	});
	return room?.tournament ?? "wc2026";
});
