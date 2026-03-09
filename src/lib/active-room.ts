import { COOKIES_KEYS } from "@/utils/constants";
import { cookies } from "next/headers";

export async function getActiveRoomId(): Promise<string | null> {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIES_KEYS.ROOM_ID)?.value ?? null;
}
