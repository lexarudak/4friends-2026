import { prisma } from "@/lib/prisma";
import { WC_GROUPS } from "@/db/world-cup";
import type { ScheduleMatch } from "@/components/widgets/schedule-match-card";

const IS_DEV = process.env.NODE_ENV !== "production";

const MOCK_SCHEDULE: ScheduleMatch[] = [
	// 1. Upcoming group match — no bets, no result
	{
		id: "mock-s1",
		group: "Group A",
		time: "15:00",
		date: "11/06/26",
		home: { name: "Mexico", flag: "🇲🇽" },
		away: { name: "Canada", flag: "🇨🇦" },
		status: "upcoming",
		bets: [],
	},
	// 2. Upcoming playoff match — no bets
	{
		id: "mock-s2",
		group: "Round of 16",
		time: "20:00",
		date: "28/06/26",
		home: { name: "Brazil", flag: "🇧🇷" },
		away: { name: "Argentina", flag: "🇦🇷" },
		status: "upcoming",
		bets: [],
	},
	// 3. Live group match — current score, minute, 4 bets (various points)
	{
		id: "mock-s3",
		group: "Group B",
		time: "18:00",
		date: "14/06/26",
		home: { name: "Spain", flag: "🇪🇸" },
		away: { name: "Germany", flag: "🇩🇪" },
		status: "live",
		minute: 67,
		resultHome: 2,
		resultAway: 1,
		bets: [
			{ userId: "u1", name: "Alice", betHome: 2, betAway: 1, points: null },
			{ userId: "u2", name: "Bob", betHome: 1, betAway: 0, points: null },
			{ userId: "u3", name: "Charlie", betHome: 3, betAway: 1, points: null },
			{ userId: "u4", name: "Dave", betHome: 0, betAway: 2, points: null },
		],
	},
	// 4. Live playoff match — with minute and winPick
	{
		id: "mock-s4",
		group: "Quarter-finals",
		time: "21:00",
		date: "03/07/26",
		home: { name: "France", flag: "🇫🇷" },
		away: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
		status: "live",
		minute: 105,
		resultHome: 1,
		resultAway: 1,
		bets: [
			{
				userId: "u1",
				name: "Alice",
				betHome: 1,
				betAway: 1,
				winPick: "home",
				points: null,
			},
			{
				userId: "u2",
				name: "Bob",
				betHome: 2,
				betAway: 0,
				winPick: "home",
				points: null,
			},
			{
				userId: "u3",
				name: "Charlie",
				betHome: 0,
				betAway: 1,
				winPick: "away",
				points: null,
			},
		],
	},
	// 5. Finished group match — exact (3), win-2 (2), win-1 (1), miss (0), many bets
	{
		id: "mock-s5",
		group: "Group C",
		time: "12:00",
		date: "15/06/26",
		home: { name: "Portugal", flag: "🇵🇹" },
		away: { name: "Morocco", flag: "🇲🇦" },
		status: "finished",
		resultHome: 3,
		resultAway: 1,
		bets: [
			{ userId: "u1", name: "Alice", betHome: 3, betAway: 1, points: 3 },
			{ userId: "u2", name: "Bob", betHome: 2, betAway: 0, points: 2 },
			{ userId: "u3", name: "Charlie", betHome: 1, betAway: 0, points: 1 },
			{ userId: "u4", name: "Dave", betHome: 0, betAway: 0, points: 0 },
			{ userId: "u5", name: "Eve", betHome: 2, betAway: 1, points: 1 },
			{ userId: "u6", name: "Frank", betHome: 4, betAway: 2, points: 1 },
			{ userId: "u7", name: "Grace", betHome: 0, betAway: 1, points: 0 },
		],
	},
	// 6. Finished playoff match — with winPick bonus (total > 3)
	{
		id: "mock-s6",
		group: "Semi-finals",
		time: "20:00",
		date: "09/07/26",
		home: { name: "Netherlands", flag: "🇳🇱" },
		away: { name: "Croatia", flag: "🇭🇷" },
		status: "finished",
		resultHome: 2,
		resultAway: 1,
		bets: [
			{
				userId: "u1",
				name: "Alice",
				betHome: 2,
				betAway: 1,
				winPick: "home",
				points: 5,
			},
			{
				userId: "u2",
				name: "Bob",
				betHome: 1,
				betAway: 0,
				winPick: "home",
				points: 3,
			},
			{
				userId: "u3",
				name: "Charlie",
				betHome: 2,
				betAway: 1,
				winPick: "away",
				points: 3,
			},
			{
				userId: "u4",
				name: "Dave",
				betHome: 0,
				betAway: 1,
				winPick: "away",
				points: 0,
			},
		],
	},
	// 7. Finished R16 — home wins 2-0, testing winPick bonus
	{
		id: "mock-s7",
		group: "Round of 16",
		time: "20:00",
		date: "01/07/26",
		home: { name: "France", flag: "🇫🇷" },
		away: { name: "Poland", flag: "🇵🇱" },
		status: "finished",
		resultHome: 2,
		resultAway: 0,
		bets: [
			{
				userId: "u1",
				name: "Alice",
				betHome: 2,
				betAway: 0,
				winPick: "home",
				points: 5,
			},
			{
				userId: "u2",
				name: "Bob",
				betHome: 1,
				betAway: 0,
				winPick: "home",
				points: 4,
			},
			{
				userId: "u3",
				name: "Charlie",
				betHome: 0,
				betAway: 1,
				winPick: "home",
				points: 2,
			},
			{
				userId: "u4",
				name: "Dave",
				betHome: 2,
				betAway: 0,
				winPick: "away",
				points: 3,
			},
			{
				userId: "u5",
				name: "Eve",
				betHome: 1,
				betAway: 0,
				winPick: "away",
				points: 2,
			},
		],
	},
	// 8. Finished QF — away wins 0-2, testing away winPick bonus
	{
		id: "mock-s8",
		group: "Quarter-finals",
		time: "21:00",
		date: "04/07/26",
		home: { name: "Germany", flag: "🇩🇪" },
		away: { name: "Spain", flag: "🇪🇸" },
		status: "finished",
		resultHome: 0,
		resultAway: 2,
		bets: [
			{
				userId: "u1",
				name: "Alice",
				betHome: 0,
				betAway: 2,
				winPick: "away",
				points: 5,
			},
			{
				userId: "u2",
				name: "Bob",
				betHome: 0,
				betAway: 1,
				winPick: "away",
				points: 3,
			},
			{
				userId: "u3",
				name: "Charlie",
				betHome: 0,
				betAway: 1,
				winPick: "home",
				points: 1,
			},
			{
				userId: "u4",
				name: "Dave",
				betHome: 1,
				betAway: 0,
				winPick: "home",
				points: 0,
			},
		],
	},
	// 10. Finished match — no bets placed
	{
		id: "mock-s10",
		group: "Group D",
		time: "18:00",
		date: "16/06/26",
		home: { name: "Japan", flag: "🇯🇵" },
		away: { name: "South Korea", flag: "🇰🇷" },
		status: "finished",
		resultHome: 0,
		resultAway: 0,
		bets: [],
	},
	// 11. Finished draw — no one got win (all miss)
	{
		id: "mock-s11",
		group: "Group E",
		time: "21:00",
		date: "17/06/26",
		home: { name: "USA", flag: "🇺🇸" },
		away: { name: "Ecuador", flag: "🇪🇨" },
		status: "finished",
		resultHome: 1,
		resultAway: 1,
		bets: [
			{ userId: "u1", name: "Alice", betHome: 2, betAway: 0, points: 0 },
			{ userId: "u2", name: "Bob", betHome: 3, betAway: 1, points: 0 },
			{ userId: "u3", name: "Charlie", betHome: 1, betAway: 1, points: 3 },
		],
	},
	// 12. Long team names
	{
		id: "mock-s12",
		group: "Group F",
		time: "15:00",
		date: "18/06/26",
		home: { name: "Bosnia and Herzegovina", flag: "🇧🇦" },
		away: { name: "Democratic Republic of the Congo", flag: "🇨🇩" },
		status: "finished",
		resultHome: 2,
		resultAway: 2,
		bets: [
			{
				userId: "u1",
				name: "Alice Wonderland-Smith",
				betHome: 2,
				betAway: 2,
				points: 3,
			},
			{ userId: "u2", name: "Bob", betHome: 1, betAway: 1, points: 1 },
		],
	},
];

const FALLBACK_FLAG = "🏳️";

const TEAM_FLAG_MAP = new Map(
	WC_GROUPS.flatMap((group) =>
		group.teams.map((team) => [team.name.toLowerCase(), team.flag])
	)
);

const TEAM_ALIASES: Record<string, string> = {
	"czech republic": "czechia",
	"south korea": "korea republic",
	"united states": "usa",
	"bosnia and herzegovina": "bosnia-herzegovina",
	turkey: "türkiye",
	turkiye: "türkiye",
	"dr congo": "congo dr",
	drcongo: "congo dr",
	"cote d'ivoire": "côte d'ivoire",
	iran: "ir iran",
};

const LIVE_STATUSES = new Set([
	"1H",
	"HT",
	"2H",
	"ET",
	"BT",
	"P",
	"LIVE",
	"INT",
]);

function getTeamFlag(name: string): string {
	const normalized = name.trim().toLowerCase();
	const alias = TEAM_ALIASES[normalized];
	return TEAM_FLAG_MAP.get(alias ?? normalized) ?? FALLBACK_FLAG;
}

function toShortDate(date: Date): string {
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	}).format(date);
}

function toTime(date: Date): string {
	return new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

function toGroupLabel(round: string): string {
	const staged = round.match(/group\s+stage\s*-\s*group\s+([a-z])/i);
	if (staged) return `Group ${staged[1].toUpperCase()}`;

	const plain = round.match(/group\s+([a-z])/i);
	if (plain) return `Group ${plain[1].toUpperCase()}`;

	const lower = round.toLowerCase();
	if (lower.includes("round of 32") || lower.includes("1/16")) return "1/16";
	if (lower.includes("round of 16") || lower.includes("1/8")) return "1/8";
	if (lower.includes("quarter")) return "1/4";
	if (lower.includes("semi")) return "Semi";
	if (lower.includes("final")) return "Final";

	return round;
}

function toStatus(statusShort: string): "upcoming" | "live" | "finished" {
	if (statusShort === "NS" || statusShort === "TBD") return "upcoming";
	if (LIVE_STATUSES.has(statusShort)) return "live";
	return "finished";
}

function getResult(
	status: "upcoming" | "live" | "finished",
	goalsHome: number | null,
	goalsAway: number | null,
	fulltimeHome: number | null,
	fulltimeAway: number | null
): { resultHome: number | null; resultAway: number | null } {
	if (status === "upcoming") {
		return { resultHome: null, resultAway: null };
	}

	if (status === "finished") {
		return {
			resultHome: fulltimeHome ?? goalsHome,
			resultAway: fulltimeAway ?? goalsAway,
		};
	}

	return {
		resultHome: goalsHome,
		resultAway: goalsAway,
	};
}

export const ScheduleService = {
	async getScheduleMatches(roomId?: string): Promise<ScheduleMatch[]> {
		if (IS_DEV) return MOCK_SCHEDULE;
		try {
			const rangeStart = new Date(Date.UTC(2026, 5, 11, 0, 0, 0));
			const rangeEnd = new Date(Date.UTC(2026, 6, 19, 23, 59, 59));

			const matches = await prisma.match.findMany({
				where: {
					date: {
						gte: rangeStart,
						lte: rangeEnd,
					},
				},
				orderBy: { date: "asc" },
				select: {
					id: true,
					round: true,
					date: true,
					statusShort: true,
					statusElapsed: true,
					homeTeamName: true,
					awayTeamName: true,
					goalsHome: true,
					goalsAway: true,
					fulltimeHome: true,
					fulltimeAway: true,
				},
			});

			if (matches.length === 0) return [];

			const matchIds = matches.map((match) => match.id);
			const bets = roomId
				? await prisma.bet.findMany({
						where: { roomId, matchId: { in: matchIds } },
						select: {
							matchId: true,
							betHome: true,
							betAway: true,
							winPick: true,
							points: true,
							bonusPoints: true,
							match: {
								select: {
									homeTeamId: true,
									awayTeamId: true,
								},
							},
							user: {
								select: { id: true, name: true },
							},
						},
					})
				: [];

			const betsByMatchId = new Map<number, ScheduleMatch["bets"]>();
			for (const bet of bets) {
				const list = betsByMatchId.get(bet.matchId) ?? [];
				const winPick =
					bet.winPick == null
						? null
						: bet.winPick === bet.match.homeTeamId
							? "home"
							: bet.winPick === bet.match.awayTeamId
								? "away"
								: null;
				list.push({
					userId: bet.user.id,
					name: bet.user.name ?? bet.user.id.split("@")[0],
					betHome: bet.betHome,
					betAway: bet.betAway,
					winPick,
					points:
						bet.points === null
							? null
							: (bet.points ?? 0) + (bet.bonusPoints ?? 0),
				});
				betsByMatchId.set(bet.matchId, list);
			}

			return matches.map((match) => {
				const status = toStatus(match.statusShort);
				const isStarted = status !== "upcoming";
				const { resultHome, resultAway } = getResult(
					status,
					match.goalsHome,
					match.goalsAway,
					match.fulltimeHome,
					match.fulltimeAway
				);

				return {
					id: String(match.id),
					group: toGroupLabel(match.round),
					time: toTime(match.date),
					date: toShortDate(match.date),
					home: {
						name: match.homeTeamName,
						flag: getTeamFlag(match.homeTeamName),
					},
					away: {
						name: match.awayTeamName,
						flag: getTeamFlag(match.awayTeamName),
					},
					status,
					minute: status === "live" ? (match.statusElapsed ?? null) : null,
					resultHome,
					resultAway,
					bets: isStarted ? (betsByMatchId.get(match.id) ?? []) : [],
				};
			});
		} catch (err) {
			console.error("[ScheduleService.getScheduleMatches]", err);
			return [];
		}
	},
};
