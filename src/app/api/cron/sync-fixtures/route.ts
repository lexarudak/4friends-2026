import { NextResponse } from "next/server";
import { FixtureSyncService } from "@/services/fixture-sync.service";

function isAuthorized(req: Request): boolean {
	const secret = process.env.CRON_SECRET;
	if (!secret) return false;
	const header = req.headers.get("authorization");
	return header === `Bearer ${secret}`;
}

export async function GET(req: Request) {
	if (!isAuthorized(req)) {
		return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
	}

	const decision = await FixtureSyncService.syncAllFixtures();
	console.info("[cron:sync-fixtures]", decision);
	return NextResponse.json(decision);
}
