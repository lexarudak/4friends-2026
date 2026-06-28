/**
 * Pull the full WC2026 season fixture list (group stage + knockout) and upsert
 * it, so newly-scheduled playoff fixtures land in the Match table immediately.
 *
 * Safe to re-run: brand-new fixtures (knockout rounds whose teams get assigned
 * as the bracket fills in) are CREATED with groupName=null; existing rows are
 * UPDATED on their result/status fields only — their `tournament` / `groupName`
 * tags are never touched, so group tables stay intact. This mirrors the
 * per-finalize refresh in FixtureSyncService.refreshTournamentFixtures.
 *
 * Run: npx tsx scripts/import-knockout.ts [leagueId] [season] [slug]
 *      (defaults: 1 2026 wc2026)
 */

import { config } from "dotenv";
config({ path: ".env" }); // production (Neon/Prisma) DB
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { ApiFixture } from "../src/lib/football-api";

function normalizeSSLMode(url: string | undefined): string | undefined {
	if (!url) return url;
	try {
		const u = new URL(url);
		const s = u.searchParams.get("sslmode");
		if (s === "require" || s === "prefer" || s === "verify-ca") {
			u.searchParams.set("sslmode", "verify-full");
		}
		return u.toString();
	} catch {
		return url;
	}
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: normalizeSSLMode(process.env.DATABASE_URL),
	}),
});

const API_BASE = "https://v3.football.api-sports.io";

async function fetchSeasonFixtures(
	leagueId: number,
	season: number
): Promise<ApiFixture[]> {
	const key = process.env.FOOTBALL_API_KEY;
	if (!key) throw new Error("FOOTBALL_API_KEY missing");
	const url = new URL(`${API_BASE}/fixtures`);
	url.searchParams.set("league", String(leagueId));
	url.searchParams.set("season", String(season));
	const res = await fetch(url.toString(), {
		headers: { "x-apisports-key": key },
	});
	if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
	const data = (await res.json()) as { response: ApiFixture[]; errors: unknown };
	const errs = data.errors;
	if (errs && typeof errs === "object" && Object.keys(errs).length) {
		throw new Error(`API errors: ${JSON.stringify(errs)}`);
	}
	return data.response;
}

function mapFixture(fx: ApiFixture) {
	return {
		referee: fx.fixture.referee,
		timezone: fx.fixture.timezone,
		date: new Date(fx.fixture.date),
		timestamp: fx.fixture.timestamp,
		periodsFirst: fx.fixture.periods.first,
		periodsSecond: fx.fixture.periods.second,
		venueId: fx.fixture.venue.id,
		venueName: fx.fixture.venue.name,
		venueCity: fx.fixture.venue.city,
		statusLong: fx.fixture.status.long,
		statusShort: fx.fixture.status.short,
		statusElapsed: fx.fixture.status.elapsed,
		statusExtra: fx.fixture.status.extra,
		leagueId: fx.league.id,
		leagueName: fx.league.name,
		leagueCountry: fx.league.country,
		leagueLogo: fx.league.logo,
		leagueSeason: fx.league.season,
		round: fx.league.round,
		homeTeamId: fx.teams.home.id,
		homeTeamName: fx.teams.home.name,
		homeTeamLogo: fx.teams.home.logo,
		homeTeamWinner: fx.teams.home.winner,
		awayTeamId: fx.teams.away.id,
		awayTeamName: fx.teams.away.name,
		awayTeamLogo: fx.teams.away.logo,
		awayTeamWinner: fx.teams.away.winner,
		goalsHome: fx.goals.home,
		goalsAway: fx.goals.away,
		halftimeHome: fx.score.halftime.home,
		halftimeAway: fx.score.halftime.away,
		fulltimeHome: fx.score.fulltime.home,
		fulltimeAway: fx.score.fulltime.away,
		extratimeHome: fx.score.extratime.home,
		extratimeAway: fx.score.extratime.away,
		penaltyHome: fx.score.penalty.home,
		penaltyAway: fx.score.penalty.away,
	};
}

async function main() {
	const leagueId = Number(process.argv[2] ?? 1);
	const season = Number(process.argv[3] ?? 2026);
	const slug = process.argv[4] ?? "wc2026";

	const fixtures = await fetchSeasonFixtures(leagueId, season);
	console.log(`Fetched ${fixtures.length} fixtures (league=${leagueId} season=${season})`);

	const ids = fixtures.map((f) => f.fixture.id);
	const existing = await prisma.match.findMany({
		where: { id: { in: ids } },
		select: { id: true },
	});
	const known = new Set(existing.map((m) => m.id));

	let created = 0;
	let updated = 0;
	const newOnes: string[] = [];
	for (const fx of fixtures) {
		const data = mapFixture(fx);
		const isNew = !known.has(fx.fixture.id);
		await prisma.match.upsert({
			where: { id: fx.fixture.id },
			create: { id: fx.fixture.id, tournament: slug, groupName: null, ...data },
			update: data,
		});
		if (isNew) {
			created++;
			newOnes.push(
				`#${fx.fixture.id} [${fx.league.round}] ${fx.fixture.date.slice(0, 16)} ${fx.teams.home.name ?? "TBD"} vs ${fx.teams.away.name ?? "TBD"}`
			);
		} else {
			updated++;
		}
	}

	console.log(`\n✓ Upserted into "${slug}": ${created} created, ${updated} updated`);
	if (newOnes.length) {
		console.log("\n=== NEW FIXTURES ===");
		newOnes.forEach((l) => console.log(l));
	}
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
