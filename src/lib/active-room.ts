import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getActiveRoomId(): Promise<string | null> {
	const session = await auth();
	return (
		(session?.user as { current_room?: string | null })?.current_room ?? null
	);
}

export async function getActiveRoomTournament(): Promise<string> {
	const roomId = await getActiveRoomId();
	if (!roomId) return "wc2026";
	const room = await prisma.room.findUnique({
		where: { name: roomId },
		select: { tournament: true },
	});
	return room?.tournament ?? "wc2026";
}
