import { prisma } from "@/lib/prisma";
import { WC_GROUPS } from "@/db/world-cup";
import type { BetHistoryItem, PersonalStat } from "@/types/api";

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

function isPlayoffRound(round: string): boolean {
	return !/group/i.test(round);
}

function normalizeScoreKey(home: number, away: number): string {
	const low = Math.min(home, away);
	const high = Math.max(home, away);
	return `${low}:${high}`;
}

function joinTopScoreKeys(
	entries: Array<[string, { count: number; points: number }]>
) {
	return entries.map(([key]) => key).join(" • ");
}

function joinTopNames(entries: Array<[string, number]>) {
	return entries.map(([name]) => name).join(" • ");
}

function buildDefaultStats(): PersonalStat[] {
	return [
		{ label: "Total Score", value: 0, size: "lg", variant: "highlight" },
		{ label: "Exact Score Hits", value: 0, size: "lg" },
		{ label: "Predicted Wins", value: 0 },
		{ label: "Avg Points per Match", value: 0 },
		// { label: "Favorite Team", value: "-", variant: "warm", size: "lg" },
		{
			label: "Favorite Score (Most Bets)",
			value: "-",
			variant: "warm",
			size: "lg",
		},
		{
			label: "Favorite Score (Most Points)",
			value: "-",
			variant: "warm",
			size: "lg",
		},
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

				const winner = isPlayoffRound(bet.match.round)
					? bet.match.homeTeamWinner === true
						? "home"
						: bet.match.awayTeamWinner === true
							? "away"
							: null
					: null;

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
					winner,
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

			// Favorite Team calculation removed

			const scoreStats = new Map<string, { count: number; points: number }>();
			for (const bet of finished) {
				const key = normalizeScoreKey(bet.betHome, bet.betAway);
				const prev = scoreStats.get(key) ?? { count: 0, points: 0 };
				scoreStats.set(key, {
					count: prev.count + 1,
					points: prev.points + (bet.points ?? 0) + (bet.bonusPoints ?? 0),
				});
			}

			const scoreEntries = [...scoreStats.entries()];

			const maxBets = Math.max(...scoreEntries.map(([, value]) => value.count));
			const favoriteScoreEntries = scoreEntries
				.filter(([, value]) => value.count === maxBets)
				.sort((a, b) => {
					if (b[1].points !== a[1].points) return b[1].points - a[1].points;
					return a[0].localeCompare(b[0]);
				});

			const maxPoints = Math.max(
				...scoreEntries.map(([, value]) => value.points)
			);
			const bestPointsScoreEntries = scoreEntries
				.filter(([, value]) => value.points === maxPoints)
				.sort((a, b) => {
					if (b[1].count !== a[1].count) return b[1].count - a[1].count;
					return a[0].localeCompare(b[0]);
				});

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
				// { label: "Favorite Team", ... } removed
				{
					label: "Favorite Score (Most Bets)",
					value:
						favoriteScoreEntries.length > 0
							? joinTopScoreKeys(favoriteScoreEntries)
							: "-",
					sub:
						favoriteScoreEntries.length === 1
							? `${favoriteScoreEntries[0][1].points} pts • ${favoriteScoreEntries[0][1].count} bets`
							: favoriteScoreEntries.length > 1
								? `${favoriteScoreEntries[0][1].count} bets each`
								: undefined,
					variant: "warm",
					size: "lg",
				},
				{
					label: "Favorite Score (Most Points)",
					value:
						bestPointsScoreEntries.length > 0
							? joinTopScoreKeys(bestPointsScoreEntries)
							: "-",
					sub:
						bestPointsScoreEntries.length === 1
							? `${bestPointsScoreEntries[0][1].points} pts • ${bestPointsScoreEntries[0][1].count} bets`
							: bestPointsScoreEntries.length > 1
								? `${bestPointsScoreEntries[0][1].points} pts each`
								: undefined,
					variant: "warm",
					size: "lg",
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
