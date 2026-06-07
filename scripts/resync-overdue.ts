/**
 * One-shot manual resync for matches that finished but never got their result
 * (status still NS/TBD long after kickoff, because nobody had the app open to
 * observe them live). Fetches each overdue match by id (`?id=` is not
 * season-gated, works on any plan), updates it, and recalculates points.
 *
 * This mirrors what the in-app lazy sync now does automatically
 * (finalizePastDueMatches), but bypasses the app's daily quota gate so you can
 * backfill immediately.
 *
 * Run:
 *   npx tsx scripts/resync-overdue.ts            # default: kickoff > 2h ago
 *   npx tsx scripts/resync-overdue.ts --hours 1  # custom grace window
 *   npx tsx scripts/resync-overdue.ts --dry      # show what would be fetched
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { isKnockoutRound } from "../src/utils/knockout.js";
import type { ApiFixture } from "../src/lib/football-api.js";

// Default targets the local DB (.env.local). Pass --prod to target the
// production DB defined in .env instead.
if (process.argv.includes("--prod")) {
	config({ path: ".env", override: true });
} else {
	config({ path: ".env.local" });
	config({ path: ".env" });
}

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

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: normalizeSSLMode(process.env.DATABASE_URL)!,
	}),
});

const API_BASE = "https://v3.football.api-sports.io";
const FINAL_OR_CANCELLED = ["FT", "AET", "PEN", "CANC", "PST", "ABD", "AWD", "WO"];
const LIVE_STATUSES = ["1H", "HT", "2H", "ET", "BT", "P", "LIVE", "INT"];
const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);

function arg(flag: string): string | undefined {
	const i = process.argv.indexOf(flag);
	return i > 0 ? process.argv[i + 1] : undefined;
}

async function fetchFixtureById(id: number): Promise<ApiFixture | null> {
	const key = process.env.FOOTBALL_API_KEY;
	if (!key) throw new Error("FOOTBALL_API_KEY missing");
	const res = await fetch(`${API_BASE}/fixtures?id=${id}`, {
		headers: { "x-apisports-key": key },
	});
	if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
	const data = await res.json();
	return (data.response?.[0] as ApiFixture) ?? null;
}

function mapFixture(fx: ApiFixture) {
	return {
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

function basePoints(bh: number, ba: number, ah: number, aa: number): number {
	if (bh === ah && ba === aa) return 3;
	if (Math.sign(bh - ba) !== Math.sign(ah - aa)) return 0;
	if (bh - ba === ah - aa) return 2;
	return 1;
}

async function recalcPoints(matchId: number) {
	const match = await prisma.match.findUnique({ where: { id: matchId } });
	if (!match || !FINAL_STATUSES.has(match.statusShort)) return 0;
	const ah = match.fulltimeHome ?? match.goalsHome;
	const aa = match.fulltimeAway ?? match.goalsAway;
	if (ah == null || aa == null) return 0;

	const bets = await prisma.bet.findMany({ where: { matchId } });
	const isPlayoff = isKnockoutRound(match.round);
	const winnerTeamId =
		match.homeTeamWinner === true
			? match.homeTeamId
			: match.awayTeamWinner === true
				? match.awayTeamId
				: null;

	const updates = bets.map((bet) => {
		const points = basePoints(bet.betHome, bet.betAway, ah, aa);
		const bonusPoints =
			isPlayoff &&
			bet.winPick != null &&
			winnerTeamId != null &&
			bet.winPick === winnerTeamId
				? 2
				: 0;
		return prisma.bet.update({
			where: { id: bet.id },
			data: { points, bonusPoints },
		});
	});
	if (updates.length === 0) return 0;
	await prisma.$transaction(updates);
	return updates.length;
}

async function main() {
	const hours = Number(arg("--hours") ?? 2);
	const dry = process.argv.includes("--dry");
	const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

	const overdue = await prisma.match.findMany({
		where: {
			date: { lt: cutoff },
			statusShort: { notIn: [...FINAL_OR_CANCELLED, ...LIVE_STATUSES] },
		},
		orderBy: { date: "asc" },
		select: {
			id: true,
			date: true,
			statusShort: true,
			homeTeamName: true,
			awayTeamName: true,
			tournament: true,
		},
	});

	console.log(
		`Found ${overdue.length} overdue match(es) (kickoff > ${hours}h ago, not final/live).`
	);
	if (overdue.length === 0) return;

	let updated = 0;
	let pointsBets = 0;
	for (const m of overdue) {
		const label = `[${m.tournament}] ${m.homeTeamName} vs ${m.awayTeamName} (id=${m.id}, was ${m.statusShort}, ${m.date.toISOString()})`;
		if (dry) {
			console.log("DRY:", label);
			continue;
		}
		try {
			const fx = await fetchFixtureById(m.id);
			if (!fx) {
				console.warn(`⚠ API returned NO fixture for id=${m.id} — ${label}. ID may be invalid.`);
				continue;
			}
			await prisma.match.update({ where: { id: m.id }, data: mapFixture(fx) });
			const newStatus = fx.fixture.status.short;
			const n = await recalcPoints(m.id);
			pointsBets += n;
			updated++;
			console.log(
				`✓ id=${m.id} ${m.statusShort} → ${newStatus} ${fx.goals.home ?? "-"}:${fx.goals.away ?? "-"} | ${n} bets scored | ${m.homeTeamName} vs ${m.awayTeamName}`
			);
		} catch (err) {
			console.error(`✗ id=${m.id}:`, err instanceof Error ? err.message : err);
		}
	}

	console.log(`\nDone. Updated ${updated} match(es), scored ${pointsBets} bet(s).`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
