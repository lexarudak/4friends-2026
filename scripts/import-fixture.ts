/**
 * Imports a single fixture from api-football into the Match table,
 * tagged with a given tournament slug. Pulls live/current data.
 *
 * Run: npx tsx scripts/import-fixture.ts <fixtureId> <tournamentSlug>
 * Example: npx tsx scripts/import-fixture.ts 1544371 ucl2526
 *
 * After import, the lazy live-sync (/api/next-match) keeps it updated,
 * because persistFixtures only touches matches already present in the DB.
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
		const sslmode = u.searchParams.get("sslmode");
		if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
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

async function fetchFixture(id: number) {
	const key = process.env.FOOTBALL_API_KEY;
	if (!key) throw new Error("FOOTBALL_API_KEY missing");
	const res = await fetch(`${API_BASE}/fixtures?id=${id}`, {
		headers: { "x-rapidapi-key": key },
	});
	if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
	const data = await res.json();
	return data.response?.[0] ?? null;
}

function mapFixture(fx: any, tournament: string) {
	return {
		id: fx.fixture.id,
		tournament,
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
	const fixtureId = Number(process.argv[2]);
	const tournament = process.argv[3];
	if (!fixtureId || !tournament) {
		console.error("Usage: tsx scripts/import-fixture.ts <fixtureId> <tournamentSlug>");
		process.exit(1);
	}

	const fx = await fetchFixture(fixtureId);
	if (!fx) {
		console.error(`Fixture ${fixtureId} not found`);
		process.exit(1);
	}

	const data = mapFixture(fx, tournament);
	await prisma.match.upsert({
		where: { id: data.id },
		create: data,
		update: data,
	});

	console.log(
		`✓ Imported ${data.id} (${tournament}): ${data.homeTeamName} ${data.goalsHome ?? "-"}-${data.goalsAway ?? "-"} ${data.awayTeamName} | ${data.round} | ${data.statusShort} ${data.statusElapsed ?? ""}'`
	);

	// If the match is finished, recalc points for all bets on it.
	const FINAL = new Set(["FT", "AET", "PEN"]);
	if (FINAL.has(data.statusShort)) {
		const actualHome = data.fulltimeHome ?? data.goalsHome;
		const actualAway = data.fulltimeAway ?? data.goalsAway;
		if (actualHome != null && actualAway != null) {
			const isPlayoff = !/group/i.test(data.round);
			const winnerTeamId =
				data.homeTeamWinner === true
					? data.homeTeamId
					: data.awayTeamWinner === true
						? data.awayTeamId
						: null;
			const bets = await prisma.bet.findMany({
				where: { matchId: data.id },
				select: { id: true, betHome: true, betAway: true, winPick: true },
			});
			let recalced = 0;
			for (const bet of bets) {
				let points = 0;
				if (bet.betHome === actualHome && bet.betAway === actualAway) points = 3;
				else if (
					Math.sign(bet.betHome - bet.betAway) ===
					Math.sign(actualHome - actualAway)
				) {
					points = bet.betHome - bet.betAway === actualHome - actualAway ? 2 : 1;
				}
				const bonusPoints =
					isPlayoff &&
					bet.winPick != null &&
					winnerTeamId != null &&
					bet.winPick === winnerTeamId
						? 2
						: 0;
				await prisma.bet.update({
					where: { id: bet.id },
					data: { points, bonusPoints },
				});
				recalced++;
			}
			console.log(`  → recalculated ${recalced} bets`);
		}
	}
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
