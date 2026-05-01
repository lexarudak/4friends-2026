/**
 * Fetches all fixtures from api-football and upserts them into the Match table.
 *
 * Usage:
 *   npm run seed:matches
 *
 * Env vars (all read from .env / .env.local):
 *   FOOTBALL_API_KEY  — required
 *   LEAGUE_ID         — optional, default 1 (FIFA World Cup)
 *   SEASON            — optional, default 2026
 *
 * ⚠️ WC 2026 fixtures are NOT yet published on the free plan (verified 2026-04-30).
 *    To seed with real data now, run:
 *      LEAGUE_ID=4 SEASON=2024 npm run seed:matches   (Euro 2024 — 51 matches, fully available)
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env then .env.local (local wins)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const API_KEY = process.env.FOOTBALL_API_KEY;
const LEAGUE_ID = process.env.LEAGUE_ID ?? "1";
const SEASON = process.env.SEASON ?? "2026";
const BASE_URL = "https://v3.football.api-sports.io";

if (!API_KEY) {
	console.error("❌ FOOTBALL_API_KEY is not set");
	process.exit(1);
}

// --- Types matching the API response ---

interface ApiTeam {
	id: number;
	name: string;
	logo: string;
	winner: boolean | null;
}

interface ApiFixture {
	fixture: {
		id: number;
		referee: string | null;
		timezone: string;
		date: string;
		timestamp: number;
		periods: { first: number | null; second: number | null };
		venue: { id: number | null; name: string | null; city: string | null };
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
		season: number;
		round: string;
	};
	teams: { home: ApiTeam; away: ApiTeam };
	goals: { home: number | null; away: number | null };
	score: {
		halftime: { home: number | null; away: number | null };
		fulltime: { home: number | null; away: number | null };
		extratime: { home: number | null; away: number | null };
		penalty: { home: number | null; away: number | null };
	};
}

interface ApiResponse {
	results: number;
	response: ApiFixture[];
}

async function fetchFixtures(): Promise<ApiFixture[]> {
	const url = `${BASE_URL}/fixtures?league=${LEAGUE_ID}&season=${SEASON}`;
	console.log(`📡 Fetching: ${url}`);

	const res = await fetch(url, {
		headers: {
			"x-rapidapi-key": API_KEY!,
			"x-rapidapi-host": "v3.football.api-sports.io",
		},
	});

	if (!res.ok) {
		throw new Error(`API responded with ${res.status}: ${await res.text()}`);
	}

	const data = (await res.json()) as ApiResponse;
	console.log(`✅ Got ${data.results} fixtures`);
	return data.response;
}

async function upsertMatches(fixtures: ApiFixture[]) {
	let upserted = 0;

	for (const f of fixtures) {
		const { fixture, league, teams, goals, score } = f;

		await prisma.match.upsert({
			where: { id: fixture.id },
			update: {
				referee: fixture.referee,
				timezone: fixture.timezone,
				date: new Date(fixture.date),
				timestamp: fixture.timestamp,
				periodsFirst: fixture.periods.first,
				periodsSecond: fixture.periods.second,
				venueId: fixture.venue.id,
				venueName: fixture.venue.name,
				venueCity: fixture.venue.city,
				statusLong: fixture.status.long,
				statusShort: fixture.status.short,
				statusElapsed: fixture.status.elapsed,
				statusExtra: fixture.status.extra,
				leagueId: league.id,
				leagueName: league.name,
				leagueCountry: league.country,
				leagueLogo: league.logo,
				leagueSeason: league.season,
				round: league.round,
				homeTeamId: teams.home.id,
				homeTeamName: teams.home.name,
				homeTeamLogo: teams.home.logo,
				homeTeamWinner: teams.home.winner,
				awayTeamId: teams.away.id,
				awayTeamName: teams.away.name,
				awayTeamLogo: teams.away.logo,
				awayTeamWinner: teams.away.winner,
				goalsHome: goals.home,
				goalsAway: goals.away,
				halftimeHome: score.halftime.home,
				halftimeAway: score.halftime.away,
				fulltimeHome: score.fulltime.home,
				fulltimeAway: score.fulltime.away,
				extratimeHome: score.extratime.home,
				extratimeAway: score.extratime.away,
				penaltyHome: score.penalty.home,
				penaltyAway: score.penalty.away,
			},
			create: {
				id: fixture.id,
				referee: fixture.referee,
				timezone: fixture.timezone,
				date: new Date(fixture.date),
				timestamp: fixture.timestamp,
				periodsFirst: fixture.periods.first,
				periodsSecond: fixture.periods.second,
				venueId: fixture.venue.id,
				venueName: fixture.venue.name,
				venueCity: fixture.venue.city,
				statusLong: fixture.status.long,
				statusShort: fixture.status.short,
				statusElapsed: fixture.status.elapsed,
				statusExtra: fixture.status.extra,
				leagueId: league.id,
				leagueName: league.name,
				leagueCountry: league.country,
				leagueLogo: league.logo,
				leagueSeason: league.season,
				round: league.round,
				homeTeamId: teams.home.id,
				homeTeamName: teams.home.name,
				homeTeamLogo: teams.home.logo,
				homeTeamWinner: teams.home.winner,
				awayTeamId: teams.away.id,
				awayTeamName: teams.away.name,
				awayTeamLogo: teams.away.logo,
				awayTeamWinner: teams.away.winner,
				goalsHome: goals.home,
				goalsAway: goals.away,
				halftimeHome: score.halftime.home,
				halftimeAway: score.halftime.away,
				fulltimeHome: score.fulltime.home,
				fulltimeAway: score.fulltime.away,
				extratimeHome: score.extratime.home,
				extratimeAway: score.extratime.away,
				penaltyHome: score.penalty.home,
				penaltyAway: score.penalty.away,
			},
		});

		upserted++;
	}

	console.log(`💾 Upserted ${upserted} matches into DB`);
}

async function main() {
	try {
		const fixtures = await fetchFixtures();

		if (fixtures.length === 0) {
			console.warn(
				`⚠️  No fixtures returned for league=${LEAGUE_ID} season=${SEASON}.`
			);
			console.warn(
				"   WC 2026 data is not yet available on the free API plan."
			);
			console.warn(
				"   To seed with Euro 2024 data: LEAGUE_ID=4 SEASON=2024 npm run seed:matches"
			);
			return;
		}

		await upsertMatches(fixtures);
		console.log("✅ Done.");
	} finally {
		await prisma.$disconnect();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
