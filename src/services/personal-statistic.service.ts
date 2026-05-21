import { prisma } from "@/lib/prisma";
import { WC_GROUPS } from "@/db/world-cup";
import type { BetHistoryItem, PersonalStat } from "@/types/api";

const IS_DEV = process.env.NODE_ENV !== "production";

const MOCK_PERSONAL_DATA: PersonalStatisticData = {
	stats: [
		{ label: "Total Score", value: 47, size: "lg", variant: "highlight" },
		{ label: "Exact Score Hits", value: 5, size: "lg" },
		{ label: "Predicted Wins", value: 12 },
		{ label: "Avg Points per Match", value: 1.96 },
		{
			label: "Favorite Team",
			value: "Bosnia and Herzegovina",
			sub: "14 pts",
			variant: "warm",
			size: "lg",
		},
		{
			label: "Favorite Score",
			value: "1 : 0",
			sub: "9 pts",
			variant: "warm",
		},
		{ label: "Best Day", value: "14 Jun", sub: "8 pts", variant: "warm" },
	],
	history: [
		{
			id: "mock-h1",
			group: "A",
			homeTeam: "Bosnia and Herzegovina",
			homeFlag: "🇧🇦",
			awayTeam: "New Zealand",
			awayFlag: "🇳🇿",
			betHome: 2,
			betAway: 0,
			resultHome: 2,
			resultAway: 0,
			time: "15:00",
			date: "14/06/26",
			points: 3,
		},
		{
			id: "mock-h2",
			group: "B",
			homeTeam: "United States of America",
			homeFlag: "🇺🇸",
			awayTeam: "Trinidad and Tobago",
			awayFlag: "🇹🇹",
			betHome: 1,
			betAway: 0,
			resultHome: 3,
			resultAway: 0,
			time: "18:00",
			date: "14/06/26",
			points: 1,
		},
		{
			id: "mock-h3",
			group: "C",
			homeTeam: "Korea Republic",
			homeFlag: "🇰🇷",
			awayTeam: "Saudi Arabia",
			awayFlag: "🇸🇦",
			betHome: 0,
			betAway: 1,
			resultHome: 1,
			resultAway: 0,
			time: "21:00",
			date: "15/06/26",
			points: 0,
		},
		{
			id: "mock-h4",
			group: "D",
			homeTeam: "Central African Republic",
			homeFlag: "🇨🇫",
			awayTeam: "Democratic Republic of the Congo",
			awayFlag: "🇨🇩",
			betHome: 1,
			betAway: 1,
			resultHome: 1,
			resultAway: 1,
			time: "12:00",
			date: "16/06/26",
			points: 3,
		},
		{
			id: "mock-h5",
			group: "E",
			homeTeam: "Argentina",
			homeFlag: "🇦🇷",
			awayTeam: "Papua New Guinea",
			awayFlag: "🇵🇬",
			betHome: 5,
			betAway: 0,
			resultHome: 4,
			resultAway: 0,
			time: "18:00",
			date: "16/06/26",
			points: 1,
		},
		{
			id: "mock-h6",
			group: "F",
			homeTeam: "Equatorial Guinea",
			homeFlag: "🇬🇶",
			awayTeam: "São Tomé and Príncipe",
			awayFlag: "🇸🇹",
			betHome: 2,
			betAway: 2,
			resultHome: null,
			resultAway: null,
			time: "15:00",
			date: "20/06/26",
			points: null,
		},
		{
			id: "mock-h7",
			group: "G",
			homeTeam: "Brazil",
			homeFlag: "🇧🇷",
			awayTeam: "Tanzania",
			awayFlag: "🇹🇿",
			betHome: 3,
			betAway: 0,
			resultHome: null,
			resultAway: null,
			time: "21:00",
			date: "20/06/26",
			points: null,
		},
	],
};

type PersonalStatisticData = {
	stats: PersonalStat[];
	history: BetHistoryItem[];
};

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

function toDayLabel(date: Date): string {
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
	}).format(date);
}

function extractGroup(round: string): string {
	const staged = round.match(/group\s+stage\s*-\s*group\s+([a-z])/i);
	if (staged) return staged[1].toUpperCase();

	const plain = round.match(/group\s+([a-z])/i);
	return plain?.[1]?.toUpperCase() ?? "-";
}

function buildDefaultStats(): PersonalStat[] {
	return [
		{ label: "Total Score", value: 0, size: "lg", variant: "highlight" },
		{ label: "Exact Score Hits", value: 0, size: "lg" },
		{ label: "Predicted Wins", value: 0 },
		{ label: "Avg Points per Match", value: 0 },
		{ label: "Favorite Team", value: "-", variant: "warm", size: "lg" },
		{ label: "Favorite Score", value: "-", variant: "warm" },
		{ label: "Best Day", value: "-", variant: "warm" },
	];
}

export function getDefaultPersonalStatisticData(): PersonalStatisticData {
	return { stats: buildDefaultStats(), history: [] };
}

export const PersonalStatisticService = {
	async getPersonalStatistic(
		userId: string,
		roomId: string
	): Promise<PersonalStatisticData> {
		if (IS_DEV) return MOCK_PERSONAL_DATA;

		try {
			const bets = await prisma.bet.findMany({
				where: { userId, roomId },
				include: { match: true },
			});

			if (bets.length === 0) {
				return getDefaultPersonalStatisticData();
			}

			const sortedBets = [...bets].sort(
				(a, b) => b.match.date.getTime() - a.match.date.getTime()
			);

			const history: BetHistoryItem[] = sortedBets.map((bet) => {
				const points =
					bet.points === null
						? null
						: (bet.points ?? 0) + (bet.bonusPoints ?? 0);

				return {
					id: String(bet.id),
					group: extractGroup(bet.match.round),
					homeTeam: bet.match.homeTeamName,
					homeFlag: getTeamFlag(bet.match.homeTeamName),
					awayTeam: bet.match.awayTeamName,
					awayFlag: getTeamFlag(bet.match.awayTeamName),
					betHome: bet.betHome,
					betAway: bet.betAway,
					resultHome: bet.match.fulltimeHome ?? bet.match.goalsHome,
					resultAway: bet.match.fulltimeAway ?? bet.match.goalsAway,
					time: toTime(bet.match.date),
					date: toShortDate(bet.match.date),
					points,
				};
			});

			const finished = bets.filter((bet) => bet.points !== null);

			const totalScore = finished.reduce(
				(sum, bet) => sum + (bet.points ?? 0) + (bet.bonusPoints ?? 0),
				0
			);
			const exactHits = finished.filter(
				(bet) => (bet.points ?? 0) === 3
			).length;
			const predictedWins = finished.filter(
				(bet) => (bet.points ?? 0) >= 1
			).length;
			const avgPoints =
				finished.length > 0
					? Math.round((totalScore / finished.length) * 100) / 100
					: 0;

			const teamPoints = new Map<string, number>();
			for (const bet of finished) {
				const points = (bet.points ?? 0) + (bet.bonusPoints ?? 0);
				if (bet.betHome > bet.betAway) {
					const current = teamPoints.get(bet.match.homeTeamName) ?? 0;
					teamPoints.set(bet.match.homeTeamName, current + points);
				} else if (bet.betAway > bet.betHome) {
					const current = teamPoints.get(bet.match.awayTeamName) ?? 0;
					teamPoints.set(bet.match.awayTeamName, current + points);
				}
			}

			const favoriteTeamEntry = [...teamPoints.entries()].sort(
				(a, b) => b[1] - a[1]
			)[0];

			const scoreStats = new Map<string, { count: number; points: number }>();
			for (const bet of finished) {
				const key = `${bet.betHome} : ${bet.betAway}`;
				const prev = scoreStats.get(key) ?? { count: 0, points: 0 };
				scoreStats.set(key, {
					count: prev.count + 1,
					points: prev.points + (bet.points ?? 0) + (bet.bonusPoints ?? 0),
				});
			}

			const favoriteScoreEntry = [...scoreStats.entries()].sort((a, b) => {
				if (b[1].count !== a[1].count) return b[1].count - a[1].count;
				return b[1].points - a[1].points;
			})[0];

			const dayPoints = new Map<string, { points: number; date: Date }>();
			for (const bet of finished) {
				const dayKey = bet.match.date.toISOString().slice(0, 10);
				const prev = dayPoints.get(dayKey) ?? {
					points: 0,
					date: bet.match.date,
				};
				dayPoints.set(dayKey, {
					points: prev.points + (bet.points ?? 0) + (bet.bonusPoints ?? 0),
					date: prev.date,
				});
			}

			const bestDayEntry = [...dayPoints.entries()]
				.map(([, value]) => value)
				.sort((a, b) => b.points - a.points)[0];

			const stats: PersonalStat[] = [
				{
					label: "Total Score",
					value: totalScore,
					size: "lg",
					variant: "highlight",
				},
				{ label: "Exact Score Hits", value: exactHits, size: "lg" },
				{ label: "Predicted Wins", value: predictedWins },
				{ label: "Avg Points per Match", value: avgPoints },
				{
					label: "Favorite Team",
					value: favoriteTeamEntry?.[0] ?? "-",
					sub: favoriteTeamEntry ? `${favoriteTeamEntry[1]} pts` : undefined,
					variant: "warm",
					size: "lg",
				},
				{
					label: "Favorite Score",
					value: favoriteScoreEntry?.[0] ?? "-",
					sub: favoriteScoreEntry
						? `${favoriteScoreEntry[1].points} pts`
						: undefined,
					variant: "warm",
				},
				{
					label: "Best Day",
					value: bestDayEntry ? toDayLabel(bestDayEntry.date) : "-",
					sub: bestDayEntry ? `${bestDayEntry.points} pts` : undefined,
					variant: "warm",
				},
			];

			return { stats, history };
		} catch (err) {
			console.error("[PersonalStatisticService.getPersonalStatistic]", err);
			return getDefaultPersonalStatisticData();
		}
	},
};
