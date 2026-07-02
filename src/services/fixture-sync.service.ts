import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
	ApiKeyMissingError,
	FootballApi,
	QuotaExceededError,
	type ApiFixture,
} from "@/lib/football-api";
import { isFinalStatus, PointsCalculator } from "@/services/points-calculator";
import {
	getTournament,
	tournamentForLeague,
	TOURNAMENTS,
} from "@/lib/tournaments";
import { isPremiumWindow } from "@/lib/api-plan";

// Re-exported for existing importers (e.g. the next-match route).
export { isPremiumWindow };

const ADVISORY_LOCK_KEY = 4262026;
const TTL_DEFAULT_MS = 5 * 60 * 1000;
const TTL_LATE_PLAYOFF_MS = 3 * 60 * 1000;
const PRE_MATCH_WINDOW_MS = 30 * 60 * 1000;

// On the permanent premium plan (see @/lib/api-plan) we poll the API every
// 2 minutes. The 5/3-min fallback TTLs below are retained only as dead defaults
// for getTtlMs's non-premium branch, which is now unreachable.
const PREMIUM_TTL_MS = 2 * 60 * 1000;

const LIVE_STATUSES = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"];
const FINAL_OR_CANCELLED = [
	"FT",
	"AET",
	"PEN",
	"CANC",
	"PST",
	"ABD",
	"AWD",
	"WO",
];

// A match is surely over this long after kickoff (90' + halftime + stoppage,
// with headroom for knockout extra time + penalties), so if our DB still shows
// it un-finished we can fetch its final result by id.
const PAST_DUE_GRACE_MS = 3 * 60 * 60 * 1000;
// Cap per-sync id lookups so a backlog of stale matches can't blow the quota.
const MAX_PAST_DUE_FETCHES = 12;

// Statuses that should have points computed (excludes cancelled/postponed).
const SCORABLE_FINAL = ["FT", "AET", "PEN"];
// Cap per-sync recalcs (cheap, DB-only) so a backlog can't stall a sync.
const MAX_RESCORE_MATCHES = 20;

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
			statusShort: { notIn: FINAL_OR_CANCELLED },
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
	await prisma.$queryRawUnsafe(
		`SELECT pg_advisory_unlock(${ADVISORY_LOCK_KEY})`
	);
}

/**
 * Re-pull the full season fixture list for a tournament and upsert it. Called
 * whenever a match finalizes so newly-scheduled knockout fixtures (whose teams
 * get assigned as the bracket fills in) appear and stay current. Creates
 * fixtures we don't have yet; updates existing ones via applyFixture only, so
 * their `tournament` / `groupName` tags are never clobbered (knockout fixtures
 * stay groupName=null even though their teams also appear in group standings).
 */
async function refreshTournamentFixtures(tournament: string): Promise<void> {
	try {
		const cfg = getTournament(tournament);
		const fixtures = await FootballApi.fetchSeasonFixtures(
			cfg.leagueId,
			cfg.season
		);
		if (fixtures.length === 0) return;
		const ops = fixtures.map((fixture) => {
			const data = applyFixture(fixture);
			return prisma.match.upsert({
				where: { id: fixture.fixture.id },
				create: {
					id: fixture.fixture.id,
					tournament,
					groupName: null,
					...data,
				},
				update: data,
			});
		});
		await prisma.$transaction(ops);
	} catch (err) {
		// Never let a fixture refresh failure break the sync that triggered it.
		console.error("[refreshTournamentFixtures]", tournament, err);
	}
}

/** Fetch the official standings for one tournament and cache them. */
async function refreshStandingsFor(tournament: string): Promise<void> {
	try {
		const cfg = getTournament(tournament);
		const response = await FootballApi.fetchStandings(cfg.leagueId, cfg.season);
		const payload = response as unknown as Prisma.InputJsonValue;
		await prisma.standingsCache.upsert({
			where: { tournament },
			create: { tournament, payload },
			update: { payload },
		});
	} catch (err) {
		// Standings are display-only — never let a refresh failure break sync.
		console.error("[refreshStandingsFor]", tournament, err);
	}
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

	// Only update matches that exist in our DB (handles multi-tournament live=all)
	const knownIds = new Set(before.map((m) => m.id));
	const relevantFixtures = fixtures.filter((f) => knownIds.has(f.fixture.id));
	if (relevantFixtures.length === 0) return { updated: 0, finalized: 0 };

	const updateOps = relevantFixtures.map((fixture) =>
		prisma.match.update({
			where: { id: fixture.fixture.id },
			data: applyFixture(fixture),
		})
	);
	await prisma.$transaction(updateOps);

	let finalized = 0;
	const finalizedTournaments = new Set<string>();
	for (const fixture of relevantFixtures) {
		const newStatus = fixture.fixture.status.short;
		const prevStatus = prevStatusById.get(fixture.fixture.id);
		if (prevStatus && !isFinalStatus(prevStatus) && isFinalStatus(newStatus)) {
			await PointsCalculator.recalculate(fixture.fixture.id);
			finalized++;
			const t = tournamentForLeague(fixture.league.id);
			if (t) finalizedTournaments.add(t);
		}
	}

	// A finished match changes the table and can decide the next knockout
	// matchup → refresh official standings and re-pull the fixture list once per
	// affected tournament so newly-scheduled playoff fixtures stay current.
	for (const tournament of finalizedTournaments) {
		await refreshStandingsFor(tournament);
		await refreshTournamentFixtures(tournament);
	}

	return { updated: relevantFixtures.length, finalized };
}

/**
 * Matches that were live in our DB but dropped out of the `live=all` response
 * have finished between syncs. `live=all` never returns finished matches, so
 * we fetch each by id to capture its final status/score and recalc points.
 */
async function finalizeDroppedLiveMatches(
	liveIds: Set<number>
): Promise<{ updated: number; finalized: number }> {
	const staleLive = await prisma.match.findMany({
		where: {
			statusShort: { in: LIVE_STATUSES },
			id: { notIn: [...liveIds] },
		},
		select: { id: true },
	});
	if (staleLive.length === 0) return { updated: 0, finalized: 0 };

	const fetched: ApiFixture[] = [];
	for (const m of staleLive) {
		const quota = await FootballApi.getQuotaStatus();
		if (!quota.canSync) break;
		const fx = await FootballApi.fetchFixtureById(m.id);
		if (fx) fetched.push(fx);
	}

	return persistFixtures(fetched);
}

/**
 * Safety net for matches that finished without us ever observing them live
 * (e.g. nobody had the app open during the match, so `live=all` never returned
 * them and they never entered a LIVE status in our DB). They sit at their
 * scheduled status (NS/TBD) forever. Once their kickoff is well in the past we
 * fetch each by id (`?id=` is not season-gated) to capture the final result and
 * recalc points. Bounded per sync to protect the quota.
 */
async function finalizePastDueMatches(): Promise<{
	updated: number;
	finalized: number;
}> {
	const cutoff = new Date(Date.now() - PAST_DUE_GRACE_MS);
	const overdue = await prisma.match.findMany({
		where: {
			date: { lt: cutoff },
			statusShort: { notIn: [...FINAL_OR_CANCELLED, ...LIVE_STATUSES] },
		},
		orderBy: { date: "asc" },
		take: MAX_PAST_DUE_FETCHES,
		select: { id: true },
	});
	if (overdue.length === 0) return { updated: 0, finalized: 0 };

	const fetched: ApiFixture[] = [];
	for (const m of overdue) {
		const quota = await FootballApi.getQuotaStatus();
		if (!quota.canSync) break;
		const fx = await FootballApi.fetchFixtureById(m.id);
		if (fx) fetched.push(fx);
	}

	return persistFixtures(fetched);
}

/**
 * Self-heal: recompute points for finished matches that still have un-scored
 * bets. The per-transition recalc in persistFixtures only fires when a sync
 * observes the NS→FT flip; if that flip is missed (status set by a bulk import,
 * or first seen already final) the bets would stay null forever. This catches
 * them on the next sync. No API calls — pure DB, and idempotent.
 */
async function rescoreUnscoredFinalMatches(): Promise<number> {
	const rows = await prisma.bet.findMany({
		where: { points: null, match: { statusShort: { in: SCORABLE_FINAL } } },
		select: { matchId: true },
		distinct: ["matchId"],
		take: MAX_RESCORE_MATCHES,
	});
	let rescored = 0;
	for (const { matchId } of rows) {
		await PointsCalculator.recalculate(matchId);
		rescored++;
	}
	return rescored;
}

/**
 * Shared sync body (caller must already hold the advisory lock): pull live
 * fixtures, finalize matches that dropped out of `live=all`, finalize any
 * overdue matches by id, and rescore any finished match whose bets were left
 * un-scored. Returns a `synced` decision with aggregate counts.
 */
async function runFullSync(): Promise<SyncDecision> {
	const fixtures = await FootballApi.fetchLiveFixtures();
	const liveIds = new Set(fixtures.map((f) => f.fixture.id));
	const live = await persistFixtures(fixtures);
	const dropped = await finalizeDroppedLiveMatches(liveIds);
	const pastDue = await finalizePastDueMatches();
	const rescored = await rescoreUnscoredFinalMatches();
	const after = await FootballApi.getQuotaStatus();
	return {
		kind: "synced",
		updated: live.updated + dropped.updated + pastDue.updated,
		finalized:
			live.finalized + dropped.finalized + pastDue.finalized + rescored,
		lastSyncAt: after.lastSyncAt ?? new Date(),
	};
}

function syncErrorDecision(scope: string, err: unknown): SyncDecision {
	if (err instanceof ApiKeyMissingError) return { kind: "api-key-missing" };
	if (err instanceof QuotaExceededError) {
		return { kind: "quota-exhausted", requestsCount: err.count };
	}
	const message = err instanceof Error ? err.message : String(err);
	console.error(`[FixtureSyncService.${scope}]`, message);
	return { kind: "error", message };
}

export const FixtureSyncService = {
	getTtlMs(hasLate: boolean): number {
		if (isPremiumWindow()) return PREMIUM_TTL_MS;
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
			return await runFullSync();
		} catch (err) {
			return syncErrorDecision("ensureFresh", err);
		} finally {
			await releaseAdvisoryLock();
		}
	},

	/**
	 * Reliable, traffic-independent sync for the daily cron. Unlike ensureFresh
	 * it has no TTL/active-match gate (the cron is the safety net that must run
	 * regardless of client polling or CDN caching) and it finalizes overdue
	 * matches across ALL tournaments by id — so leagues that aren't covered by
	 * any live viewer (e.g. Belarus) still get their results and points.
	 *
	 * After the live/overdue sync it unconditionally re-pulls the full season
	 * fixture list for every tournament so newly-scheduled knockout fixtures
	 * (whose teams get assigned as the bracket fills in) appear in the DB even
	 * when no NS→FT transition was observed during this sync run.
	 */
	async syncNow(): Promise<SyncDecision> {
		const status = await FootballApi.getQuotaStatus();
		if (!status.canSync) {
			return { kind: "quota-exhausted", requestsCount: status.requestsCount };
		}

		const locked = await tryAdvisoryLock();
		if (!locked) return { kind: "lock-busy" };

		try {
			const result = await runFullSync();
			// Unconditionally refresh the full fixture list so knockout fixtures
			// that became available after a completed match are always picked up,
			// even when no live transition was observed during this sync.
			for (const slug of Object.keys(TOURNAMENTS)) {
				await refreshTournamentFixtures(slug);
			}
			return result;
		} catch (err) {
			return syncErrorDecision("syncNow", err);
		} finally {
			await releaseAdvisoryLock();
		}
	},

	/** Daily safety-net refresh of standings for every known tournament. */
	async syncStandings(): Promise<SyncDecision> {
		const status = await FootballApi.getQuotaStatus();
		if (!status.canSync) {
			return { kind: "quota-exhausted", requestsCount: status.requestsCount };
		}

		let refreshed = 0;
		for (const slug of Object.keys(TOURNAMENTS)) {
			await refreshStandingsFor(slug);
			refreshed++;
		}
		const after = await FootballApi.getQuotaStatus();
		return {
			kind: "synced",
			updated: refreshed,
			finalized: 0,
			lastSyncAt: after.lastSyncAt ?? new Date(),
		};
	},
};
