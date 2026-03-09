import { auth } from "@/auth";
import { RoomService } from "@/services/room.service";
import { PAGES } from "@/utils/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function GET() {
	const session = await auth();

	if (!session?.user?.email) {
		return NextResponse.redirect(new URL(PAGES.LOGIN, BASE_URL));
	}

	return NextResponse.redirect(new URL(PAGES.HOME, BASE_URL));
}
