import { prisma } from "@/lib/prisma";
import { WC_GROUPS } from "@/db/world-cup";
import type { Match, NextMatchTimerPayload } from "@/types/api";

const FALLBACK_FLAG = "🏳️";
export const NEXT_MATCH_WINDOW_HOURS = 48;

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

function normalizeTeamName(name: string): string {
	return name.trim().toLowerCase();
}

function getTeamFlag(name: string): string {
	const normalized = normalizeTeamName(name);
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
	const groupMatch = round.match(/group\s+([a-z])/i);
	if (groupMatch) {
		return `Group ${groupMatch[1].toUpperCase()}`;
	}

	const lower = round.toLowerCase();
	if (lower.includes("round of 32") || lower.includes("1/32")) {
		return "1/32 Final";
	}
	if (lower.includes("round of 16") || lower.includes("1/8")) {
		return "1/8 Final";
	}
	if (lower.includes("quarter")) {
		return "Quarter Final";
	}
	if (lower.includes("semi")) {
		return "Semi Final";
	}
	if (lower.includes("final")) {
		return "Final";
	}

	return round;
}

export const MatchService = {
	async getNextMatchTimerPayload(): Promise<NextMatchTimerPayload> {
		const now = new Date();

		try {
			const nextMatch = await prisma.match.findFirst({
				where: {
					date: { gt: now },
					statusShort: "NS",
				},
				orderBy: { date: "asc" },
				select: {
					id: true,
					round: true,
					date: true,
					homeTeamName: true,
					awayTeamName: true,
				},
			});

			if (!nextMatch) {
				return {
					serverNow: now.toISOString(),
					isTournamentFinished: true,
					nextMatch: null,
				};
			}

			return {
				serverNow: now.toISOString(),
				isTournamentFinished: false,
				nextMatch: {
					id: String(nextMatch.id),
					group: toGroupLabel(nextMatch.round),
					targetDateIso: nextMatch.date.toISOString(),
					home: {
						name: nextMatch.homeTeamName,
						flag: getTeamFlag(nextMatch.homeTeamName),
					},
					away: {
						name: nextMatch.awayTeamName,
						flag: getTeamFlag(nextMatch.awayTeamName),
					},
				},
			};
		} catch (err) {
			console.error("[MatchService.getNextMatchTimerPayload]", err);
			return {
				serverNow: now.toISOString(),
				isTournamentFinished: true,
				nextMatch: null,
			};
		}
	},

	async getMatches(): Promise<Match[]> {
		try {
			const now = new Date();

			const nextMatch = await prisma.match.findFirst({
				where: {
					date: { gte: now },
					statusShort: "NS",
				},
				orderBy: { date: "asc" },
				select: { date: true },
			});

			if (!nextMatch) return [];

			const endTime = new Date(nextMatch.date);
			endTime.setHours(endTime.getHours() + NEXT_MATCH_WINDOW_HOURS);

			const rows = await prisma.match.findMany({
				where: {
					date: {
						gte: nextMatch.date,
						lte: endTime,
					},
					statusShort: "NS",
				},
				orderBy: { date: "asc" },
				select: {
					id: true,
					round: true,
					date: true,
					homeTeamName: true,
					awayTeamName: true,
				},
			});

			const upcomingMatches = rows.map((row) => ({
				id: String(row.id),
				group: toGroupLabel(row.round),
				time: toTime(row.date),
				date: toShortDate(row.date),
				home: {
					name: row.homeTeamName,
					flag: getTeamFlag(row.homeTeamName),
				},
				away: {
					name: row.awayTeamName,
					flag: getTeamFlag(row.awayTeamName),
				},
			}));

			return upcomingMatches;
		} catch (err) {
			console.error("[MatchService.getMatches]", err);
			return [];
		}
	},
};
