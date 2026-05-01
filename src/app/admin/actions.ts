"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_PAGE_PASSWORD, COOKIES_KEYS, PAGES } from "@/utils/constants";

export type AdminAccessState = { error: string | null };

export async function unlockAdmin(
	_prevState: AdminAccessState,
	formData: FormData
): Promise<AdminAccessState> {
	const password = (formData.get("password") as string | null)?.trim();
	const path = (formData.get("path") as string | null)?.trim() || PAGES.ADMIN;

	if (!password) {
		return { error: "Please enter the admin password" };
	}

	if (password !== ADMIN_PAGE_PASSWORD) {
		return { error: "Incorrect password" };
	}

	const cookieStore = await cookies();
	cookieStore.set(COOKIES_KEYS.ADMIN_ACCESS_PATH, path, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
	});

	redirect(path);
}

export async function lockAdmin() {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIES_KEYS.ADMIN_ACCESS_PATH);
	redirect(PAGES.ADMIN);
}
