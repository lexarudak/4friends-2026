import { prisma } from "@/lib/prisma";

const API_BASE_URL = "https://v3.football.api-sports.io";
const DEFAULT_LEAGUE_ID = 1;
const DEFAULT_SEASON = 2026;
const SOFT_CAP = 95;
const HARD_CAP = 99;

const WC_LEAGUE_ID = Number(process.env.LEAGUE_ID ?? DEFAULT_LEAGUE_ID);
const WC_SEASON = Number(process.env.SEASON ?? DEFAULT_SEASON);

export class QuotaExceededError extends Error {
	constructor(public readonly count: number) {
		super(`Daily API quota exceeded (${count}/${HARD_CAP})`);
		this.name = "QuotaExceededError";
	}
}

export class ApiKeyMissingError extends Error {
	constructor() {
		super("FOOTBALL_API_KEY is not configured");
		this.name = "ApiKeyMissingError";
	}
}

type ApiResponse<T> = {
	get: string;
	parameters: Record<string, string>;
	errors: unknown[];
	results: number;
	response: T;
};

type ApiFixtureResponse = ApiResponse<ApiFixture[]>;
type ApiStandingsResponse = ApiResponse<unknown[]>;

export type ApiFixture = {
	fixture: {
		id: number;
		referee: string | null;
		timezone: string;
		date: string;
		timestamp: number;
		periods: { first: number | null; second: number | null };
		venue: {
			id: number | null;
			name: string | null;
			city: string | null;
		};
		status: {
			long: string;
			short: string;
			elapsed: number | null;
			extra: number | null;
		};
	};
	league: {
		id: number;
		name: string;
		country: string;
		logo: string;
		flag: string | null;
		season: number;
		round: string;
	};
	teams: {
		home: { id: number; name: string; logo: string; winner: boolean | null };
		away: { id: number; name: string; logo: string; winner: boolean | null };
	};
	goals: { home: number | null; away: number | null };
	score: {
		halftime: { home: number | null; away: number | null };
		fulltime: { home: number | null; away: number | null };
		extratime: { home: number | null; away: number | null };
		penalty: { home: number | null; away: number | null };
	};
};

function todayUtcDate(): Date {
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
	);
}

async function consumeQuota(): Promise<number> {
	const date = todayUtcDate();
	const row = await prisma.apiQuota.upsert({
		where: { date },
		create: { date, requestsCount: 1 },
		update: { requestsCount: { increment: 1 } },
	});
	return row.requestsCount;
}

async function markSyncSuccess(): Promise<void> {
	const date = todayUtcDate();
	await prisma.apiQuota.update({
		where: { date },
		data: { lastSyncAt: new Date(), lastError: null },
	});
}

async function markSyncError(error: string): Promise<void> {
	const date = todayUtcDate();
	await prisma.apiQuota.upsert({
		where: { date },
		create: { date, lastError: error.slice(0, 500) },
		update: { lastError: error.slice(0, 500) },
	});
}

async function getQuotaSnapshot(): Promise<number> {
	const date = todayUtcDate();
	const row = await prisma.apiQuota.findUnique({ where: { date } });
	return row?.requestsCount ?? 0;
}

async function request<T>(
	path: string,
	params: Record<string, string | number>
): Promise<T> {
	const apiKey = process.env.FOOTBALL_API_KEY;
	if (!apiKey) throw new ApiKeyMissingError();

	const currentCount = await getQuotaSnapshot();
	if (currentCount >= HARD_CAP) {
		throw new QuotaExceededError(currentCount);
	}

	const url = new URL(`${API_BASE_URL}${path}`);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, String(value));
	}

	const newCount = await consumeQuota();
	console.info("[football-api] request", {
		path,
		params,
		quotaUsed: newCount,
	});

	try {
		const res = await fetch(url.toString(), {
			headers: { "x-rapidapi-key": apiKey },
			cache: "no-store",
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
		}

		const data = (await res.json()) as T;
		await markSyncSuccess();
		return data;
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		await markSyncError(message);
		throw err;
	}
}

export const FootballApi = {
	WC_LEAGUE_ID,
	WC_SEASON,
	SOFT_CAP,
	HARD_CAP,

	async fetchLiveFixtures(): Promise<ApiFixture[]> {
		const data = await request<ApiFixtureResponse>("/fixtures", {
			live: "all",
			league: WC_LEAGUE_ID,
			season: WC_SEASON,
		});
		return data.response;
	},

	async fetchFixturesForDateRange(
		from: string,
		to: string
	): Promise<ApiFixture[]> {
		const data = await request<ApiFixtureResponse>("/fixtures", {
			league: WC_LEAGUE_ID,
			season: WC_SEASON,
			from,
			to,
		});
		return data.response;
	},

	async fetchFixtureById(id: number): Promise<ApiFixture | null> {
		const data = await request<ApiFixtureResponse>("/fixtures", { id });
		return data.response[0] ?? null;
	},

	async fetchStandings(): Promise<unknown[]> {
		const data = await request<ApiStandingsResponse>("/standings", {
			league: WC_LEAGUE_ID,
			season: WC_SEASON,
		});
		return data.response;
	},

	async getQuotaStatus(): Promise<{
		requestsCount: number;
		lastSyncAt: Date | null;
		lastError: string | null;
		softCap: number;
		hardCap: number;
		canSync: boolean;
	}> {
		const date = todayUtcDate();
		const row = await prisma.apiQuota.findUnique({ where: { date } });
		const count = row?.requestsCount ?? 0;
		return {
			requestsCount: count,
			lastSyncAt: row?.lastSyncAt ?? null,
			lastError: row?.lastError ?? null,
			softCap: SOFT_CAP,
			hardCap: HARD_CAP,
			canSync: count < SOFT_CAP,
		};
	},
};
