import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Deduped per request: multiple server components on one page resolve the
// active room once instead of repeating auth() + room.findUnique.
export const getActiveRoomId = cache(async (): Promise<string | null> => {
	const session = await auth();
	return (
		(session?.user as { current_room?: string | null })?.current_room ?? null
	);
});

const getActiveRoom = cache(
	async (): Promise<{ tournament: string; imageUrl: string | null } | null> => {
		const roomId = await getActiveRoomId();
		if (!roomId) return null;
		return prisma.room.findUnique({
			where: { name: roomId },
			select: { tournament: true, imageUrl: true },
		});
	}
);

export const getActiveRoomTournament = cache(async (): Promise<string> => {
	const room = await getActiveRoom();
	return room?.tournament ?? "wc2026";
});

export const getActiveRoomImage = cache(async (): Promise<string | null> => {
	const room = await getActiveRoom();
	return room?.imageUrl ?? null;
});
