import { prisma } from "@/lib/prisma";
import { WC_GROUPS } from "@/db/world-cup";
import { FootballApi } from "@/lib/football-api";
import type { ScheduleMatch } from "@/components/widgets/schedule-match-card";

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
		try {
			const rangeStart = new Date(Date.UTC(2026, 4, 1, 0, 0, 0));
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
			const quotaStatus = await FootballApi.getQuotaStatus();
			const lastSyncAtIso = quotaStatus.lastSyncAt?.toISOString() ?? null;
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
				const isStartedByTime = match.date <= new Date();
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
					statusShort: status === "live" ? match.statusShort : null,
					lastSyncAt: status === "live" ? lastSyncAtIso : null,
					resultHome,
					resultAway,
					bets: isStartedByTime ? (betsByMatchId.get(match.id) ?? []) : [],
				};
			});
		} catch (err) {
			console.error("[ScheduleService.getScheduleMatches]", err);
			return [];
		}
	},
};
