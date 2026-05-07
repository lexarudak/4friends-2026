import { cookies } from "next/headers";
import { COOKIES_KEYS, PAGES } from "@/utils/constants";

export async function hasAdminAccess(): Promise<boolean> {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIES_KEYS.ADMIN_ACCESS_PATH)?.value === PAGES.ADMIN;
}
