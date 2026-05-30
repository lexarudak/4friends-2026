import { NextResponse } from "next/server";
import { hasAdminAccess } from "@/lib/admin-access";
import { FootballApi } from "@/lib/football-api";
import { FixtureSyncService } from "@/services/fixture-sync.service";
import { API_ERROR_CODES } from "@/utils/constants";

export async function GET() {
	if (!(await hasAdminAccess())) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.UNAUTHORIZED },
			{ status: 401 }
		);
	}

	const status = await FootballApi.getQuotaStatus();
	return NextResponse.json(status, {
		headers: { "Cache-Control": "no-store" },
	});
}

export async function POST() {
	if (!(await hasAdminAccess())) {
		return NextResponse.json(
			{ error: API_ERROR_CODES.UNAUTHORIZED },
			{ status: 401 }
		);
	}

	const decision = await FixtureSyncService.ensureFresh();
	return NextResponse.json(decision, {
		headers: { "Cache-Control": "no-store" },
	});
}
