import { auth } from "@/auth";

export async function getActiveRoomId(): Promise<string | null> {
	const session = await auth();
	return (
		(session?.user as { current_room?: string | null })?.current_room ?? null
	);
}
