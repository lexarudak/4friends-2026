import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
	ApiKeyMissingError,
	FootballApi,
	QuotaExceededError,
	type ApiFixture,
} from "@/lib/football-api";
import { isFinalStatus, PointsCalculator } from "@/services/points-calculator";

const ADVISORY_LOCK_KEY = 4262026;
const TTL_DEFAULT_MS = 5 * 60 * 1000;
const TTL_LATE_PLAYOFF_MS = 3 * 60 * 1000;
const PRE_MATCH_WINDOW_MS = 30 * 60 * 1000;

function isLateRound(round: string): boolean {
	return /quarter|semi|final/i.test(round) && !/group/i.test(round);
}

export type SyncDecision =
	| { kind: "no-active-matches" }
	| { kind: "fresh-cache"; lastSyncAt: Date; ttlMs: number }
	| { kind: "quota-exhausted"; requestsCount: number }
	| { kind: "lock-busy" }
	| { kind: "synced"; updated: number; finalized: number; lastSyncAt: Date }
	| { kind: "api-key-missing" }
	| { kind: "error"; message: string };

async function getActiveMatchContext(): Promise<{
	hasActive: boolean;
	hasLate: boolean;
}> {
	const now = new Date();
	const windowEnd = new Date(now.getTime() + PRE_MATCH_WINDOW_MS);

	const active = await prisma.match.findMany({
		where: {
			date: { lte: windowEnd },
			statusShort: { notIn: ["FT", "AET", "PEN", "CANC", "PST", "ABD", "AWD", "WO"] },
		},
		select: { round: true, statusShort: true, date: true },
	});

	if (active.length === 0) return { hasActive: false, hasLate: false };

	const hasLate = active.some((m) => isLateRound(m.round));
	return { hasActive: true, hasLate };
}

function applyFixture(fixture: ApiFixture) {
	return {
		referee: fixture.fixture.referee,
		timezone: fixture.fixture.timezone,
		date: new Date(fixture.fixture.date),
		timestamp: fixture.fixture.timestamp,
		periodsFirst: fixture.fixture.periods.first,
		periodsSecond: fixture.fixture.periods.second,
		venueId: fixture.fixture.venue.id,
		venueName: fixture.fixture.venue.name,
		venueCity: fixture.fixture.venue.city,
		statusLong: fixture.fixture.status.long,
		statusShort: fixture.fixture.status.short,
		statusElapsed: fixture.fixture.status.elapsed,
		statusExtra: fixture.fixture.status.extra,
		leagueId: fixture.league.id,
		leagueName: fixture.league.name,
		leagueCountry: fixture.league.country,
		leagueLogo: fixture.league.logo,
		leagueSeason: fixture.league.season,
		round: fixture.league.round,
		homeTeamId: fixture.teams.home.id,
		homeTeamName: fixture.teams.home.name,
		homeTeamLogo: fixture.teams.home.logo,
		homeTeamWinner: fixture.teams.home.winner,
		awayTeamId: fixture.teams.away.id,
		awayTeamName: fixture.teams.away.name,
		awayTeamLogo: fixture.teams.away.logo,
		awayTeamWinner: fixture.teams.away.winner,
		goalsHome: fixture.goals.home,
		goalsAway: fixture.goals.away,
		halftimeHome: fixture.score.halftime.home,
		halftimeAway: fixture.score.halftime.away,
		fulltimeHome: fixture.score.fulltime.home,
		fulltimeAway: fixture.score.fulltime.away,
		extratimeHome: fixture.score.extratime.home,
		extratimeAway: fixture.score.extratime.away,
		penaltyHome: fixture.score.penalty.home,
		penaltyAway: fixture.score.penalty.away,
	};
}

async function tryAdvisoryLock(): Promise<boolean> {
	const rows = await prisma.$queryRawUnsafe<{ locked: boolean }[]>(
		`SELECT pg_try_advisory_lock(${ADVISORY_LOCK_KEY}) AS locked`
	);
	return rows[0]?.locked === true;
}

async function releaseAdvisoryLock(): Promise<void> {
	await prisma.$queryRawUnsafe(`SELECT pg_advisory_unlock(${ADVISORY_LOCK_KEY})`);
}

async function persistFixtures(
	fixtures: ApiFixture[]
): Promise<{ updated: number; finalized: number }> {
	if (fixtures.length === 0) return { updated: 0, finalized: 0 };

	const incomingIds = fixtures.map((f) => f.fixture.id);
	const before = await prisma.match.findMany({
		where: { id: { in: incomingIds } },
		select: { id: true, statusShort: true },
	});
	const prevStatusById = new Map(before.map((m) => [m.id, m.statusShort]));

	const updateOps = fixtures.map((fixture) =>
		prisma.match.update({
			where: { id: fixture.fixture.id },
			data: applyFixture(fixture),
		})
	);
	await prisma.$transaction(updateOps);

	let finalized = 0;
	for (const fixture of fixtures) {
		const newStatus = fixture.fixture.status.short;
		const prevStatus = prevStatusById.get(fixture.fixture.id);
		if (
			prevStatus &&
			!isFinalStatus(prevStatus) &&
			isFinalStatus(newStatus)
		) {
			await PointsCalculator.recalculate(fixture.fixture.id);
			finalized++;
		}
	}

	return { updated: fixtures.length, finalized };
}

export const FixtureSyncService = {
	getTtlMs(hasLate: boolean): number {
		return hasLate ? TTL_LATE_PLAYOFF_MS : TTL_DEFAULT_MS;
	},

	async getLastSyncAt(): Promise<Date | null> {
		const status = await FootballApi.getQuotaStatus();
		return status.lastSyncAt;
	},

	async ensureFresh(): Promise<SyncDecision> {
		const ctx = await getActiveMatchContext();
		if (!ctx.hasActive) return { kind: "no-active-matches" };

		const ttlMs = this.getTtlMs(ctx.hasLate);
		const status = await FootballApi.getQuotaStatus();

		if (status.lastSyncAt) {
			const age = Date.now() - status.lastSyncAt.getTime();
			if (age < ttlMs) {
				return { kind: "fresh-cache", lastSyncAt: status.lastSyncAt, ttlMs };
			}
		}

		if (!status.canSync) {
			return { kind: "quota-exhausted", requestsCount: status.requestsCount };
		}

		const locked = await tryAdvisoryLock();
		if (!locked) return { kind: "lock-busy" };

		try {
			const fixtures = await FootballApi.fetchLiveFixtures();
			const { updated, finalized } = await persistFixtures(fixtures);
			const after = await FootballApi.getQuotaStatus();
			return {
				kind: "synced",
				updated,
				finalized,
				lastSyncAt: after.lastSyncAt ?? new Date(),
			};
		} catch (err) {
			if (err instanceof ApiKeyMissingError) return { kind: "api-key-missing" };
			if (err instanceof QuotaExceededError) {
				return { kind: "quota-exhausted", requestsCount: err.count };
			}
			const message = err instanceof Error ? err.message : String(err);
			console.error("[FixtureSyncService.ensureFresh]", message);
			return { kind: "error", message };
		} finally {
			await releaseAdvisoryLock();
		}
	},

	async syncAllFixtures(): Promise<SyncDecision> {
		const status = await FootballApi.getQuotaStatus();
		if (!status.canSync) {
			return { kind: "quota-exhausted", requestsCount: status.requestsCount };
		}

		const locked = await tryAdvisoryLock();
		if (!locked) return { kind: "lock-busy" };

		try {
			const fixtures = await FootballApi.fetchFixturesForDateRange(
				"2026-06-01",
				"2026-07-31"
			);
			const { updated, finalized } = await persistFixtures(fixtures);
			const after = await FootballApi.getQuotaStatus();
			return {
				kind: "synced",
				updated,
				finalized,
				lastSyncAt: after.lastSyncAt ?? new Date(),
			};
		} catch (err) {
			if (err instanceof ApiKeyMissingError) return { kind: "api-key-missing" };
			if (err instanceof QuotaExceededError) {
				return { kind: "quota-exhausted", requestsCount: err.count };
			}
			const message = err instanceof Error ? err.message : String(err);
			console.error("[FixtureSyncService.syncAllFixtures]", message);
			return { kind: "error", message };
		} finally {
			await releaseAdvisoryLock();
		}
	},

	async syncStandings(): Promise<SyncDecision> {
		const status = await FootballApi.getQuotaStatus();
		if (!status.canSync) {
			return { kind: "quota-exhausted", requestsCount: status.requestsCount };
		}

		try {
			const response = await FootballApi.fetchStandings();
			const payload = response as unknown as Prisma.InputJsonValue;
			await prisma.standingsCache.upsert({
				where: { id: 1 },
				create: { id: 1, payload },
				update: { payload },
			});
			const after = await FootballApi.getQuotaStatus();
			return {
				kind: "synced",
				updated: response.length,
				finalized: 0,
				lastSyncAt: after.lastSyncAt ?? new Date(),
			};
		} catch (err) {
			if (err instanceof ApiKeyMissingError) return { kind: "api-key-missing" };
			if (err instanceof QuotaExceededError) {
				return { kind: "quota-exhausted", requestsCount: err.count };
			}
			const message = err instanceof Error ? err.message : String(err);
			console.error("[FixtureSyncService.syncStandings]", message);
			return { kind: "error", message };
		}
	},
};
