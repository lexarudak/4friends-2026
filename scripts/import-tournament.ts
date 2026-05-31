/**
 * Bulk-imports a whole tournament's fixtures from api-football into the Match
 * table, tagged with a tournament slug. Use this ONCE while on a paid plan
 * (season listing is plan-gated); afterwards live=all / ?id= keep matches
 * updated on the free plan.
 *
 * Run:
 *   npx tsx scripts/import-tournament.ts <leagueId> <season> <slug> [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--purge]
 *
 * Examples:
 *   # Full World Cup, replacing placeholder-seeded matches:
 *   npx tsx scripts/import-tournament.ts 1 2026 wc2026 --purge
 *   # Belarus First League up to June 7:
 *   npx tsx scripts/import-tournament.ts 117 2026 belarus1 --to 2026-06-07 --purge
 *
 * --purge deletes the tournament's existing matches (and their bets) first,
 * so real fixture IDs cleanly replace any placeholder-seeded rows.
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

function normalizeSSLMode(url: string | undefined): string | undefined {
	if (!url) return url;
	try {
		const u = new URL(url);
		const m = u.searchParams.get("sslmode");
		if (m === "require" || m === "prefer" || m === "verify-ca") {
			u.searchParams.set("sslmode", "verify-full");
		}
		return u.toString();
	} catch {
		return url;
	}
}

const adapter = new PrismaPg({
	connectionString: normalizeSSLMode(process.env.DATABASE_URL)!,
});
const prisma = new PrismaClient({ adapter });

const API_BASE = "https://v3.football.api-sports.io";

function arg(flag: string): string | undefined {
	const i = process.argv.indexOf(flag);
	return i > 0 ? process.argv[i + 1] : undefined;
}

async function apiGet(path: string, params: Record<string, string | number>) {
	const key = process.env.FOOTBALL_API_KEY;
	if (!key) throw new Error("FOOTBALL_API_KEY missing");
	const url = new URL(`${API_BASE}${path}`);
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
	const res = await fetch(url.toString(), { headers: { "x-apisports-key": key } });
	if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
	const data = await res.json();
	if (data.errors && Object.keys(data.errors).length) {
		throw new Error(`API errors: ${JSON.stringify(data.errors)}`);
	}
	return data.response as any[];
}

async function fetchFixtures(params: Record<string, string | number>) {
	return apiGet("/fixtures", params);
}

/** teamId -> "Group X" map, from the standings endpoint (only real A–L groups). */
async function fetchTeamGroups(
	leagueId: number,
	season: number
): Promise<Map<number, string>> {
	const map = new Map<number, string>();
	try {
		const resp = await apiGet("/standings", { league: leagueId, season });
		const groups = resp?.[0]?.league?.standings ?? [];
		for (const group of groups) {
			for (const row of group) {
				const g: string | undefined = row.group;
				if (g && /^Group\s+[A-Z]$/i.test(g) && row.team?.id != null) {
					map.set(row.team.id, g);
				}
			}
		}
	} catch (err) {
		console.warn(
			"[import-tournament] standings fetch failed, groups left empty:",
			err instanceof Error ? err.message : err
		);
	}
	return map;
}

function mapFixture(fx: any, tournament: string, groupName: string | null) {
	return {
		id: fx.fixture.id,
		tournament,
		groupName,
		referee: fx.fixture.referee,
		timezone: fx.fixture.timezone,
		date: new Date(fx.fixture.date),
		timestamp: fx.fixture.timestamp,
		periodsFirst: fx.fixture.periods?.first ?? null,
		periodsSecond: fx.fixture.periods?.second ?? null,
		venueId: fx.fixture.venue?.id ?? null,
		venueName: fx.fixture.venue?.name ?? null,
		venueCity: fx.fixture.venue?.city ?? null,
		statusLong: fx.fixture.status.long,
		statusShort: fx.fixture.status.short,
		statusElapsed: fx.fixture.status.elapsed ?? null,
		statusExtra: fx.fixture.status.extra ?? null,
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
		halftimeHome: fx.score.halftime?.home ?? null,
		halftimeAway: fx.score.halftime?.away ?? null,
		fulltimeHome: fx.score.fulltime?.home ?? null,
		fulltimeAway: fx.score.fulltime?.away ?? null,
		extratimeHome: fx.score.extratime?.home ?? null,
		extratimeAway: fx.score.extratime?.away ?? null,
		penaltyHome: fx.score.penalty?.home ?? null,
		penaltyAway: fx.score.penalty?.away ?? null,
	};
}

async function main() {
	const leagueId = Number(process.argv[2]);
	const season = Number(process.argv[3]);
	const slug = process.argv[4];
	const from = arg("--from");
	const to = arg("--to");
	const purge = process.argv.includes("--purge");

	if (!leagueId || !season || !slug) {
		console.error(
			"Usage: tsx scripts/import-tournament.ts <leagueId> <season> <slug> [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--purge]"
		);
		process.exit(1);
	}

	const params: Record<string, string | number> = { league: leagueId, season };
	if (from) params.from = from;
	if (to) params.to = to;

	const fixtures = await fetchFixtures(params);
	console.log(`Fetched ${fixtures.length} fixtures for league=${leagueId} season=${season}`);
	if (fixtures.length === 0) {
		console.log("Nothing to import.");
		return;
	}

	const teamGroups = await fetchTeamGroups(leagueId, season);
	console.log(`Team→group entries from standings: ${teamGroups.size}`);

	if (purge) {
		const delBets = await prisma.bet.deleteMany({
			where: { match: { tournament: slug } },
		});
		const delMatches = await prisma.match.deleteMany({
			where: { tournament: slug },
		});
		console.log(
			`Purged tournament "${slug}": ${delMatches.count} matches, ${delBets.count} bets`
		);
	}

	let imported = 0;
	for (const fx of fixtures) {
		const groupName =
			teamGroups.get(fx.teams.home.id) ??
			teamGroups.get(fx.teams.away.id) ??
			null;
		const data = mapFixture(fx, slug, groupName);
		await prisma.match.upsert({
			where: { id: data.id },
			create: data,
			update: data,
		});
		imported++;
	}

	const dates = fixtures.map((f) => f.fixture.date).sort();
	console.log(
		`✓ Imported ${imported} matches into "${slug}" | ${dates[0]?.slice(0, 10)} → ${dates[dates.length - 1]?.slice(0, 10)}`
	);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
