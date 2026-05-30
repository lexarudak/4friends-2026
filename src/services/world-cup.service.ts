import { prisma } from "@/lib/prisma";
import {
	WC_GROUPS,
	type WcGroup,
	type WcKnockoutMatch,
	type WcKnockoutStage,
	type WcTeam,
} from "@/db/world-cup";

type WorldCupData = {
	groups: WcGroup[];
	knockout: Record<WcKnockoutStage, WcKnockoutMatch[]>;
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

function isFinishedStatus(statusShort: string): boolean {
	if (statusShort === "NS" || statusShort === "TBD") return false;
	if (LIVE_STATUSES.has(statusShort)) return false;
	return true;
}

function parseGroupName(round: string): string | null {
	const staged = round.match(/group\s+stage\s*-\s*group\s+([a-z])/i);
	if (staged) return `Group ${staged[1].toUpperCase()}`;

	const plain = round.match(/group\s+([a-z])/i);
	if (plain) return `Group ${plain[1].toUpperCase()}`;

	return null;
}

function parseKnockoutStage(round: string): WcKnockoutStage | null {
	const lower = round.toLowerCase();
	if (lower.includes("round of 32") || lower.includes("1/16")) return "r32";
	if (lower.includes("round of 16") || lower.includes("1/8")) return "r16";
	if (lower.includes("quarter")) return "qf";
	if (lower.includes("semi")) return "sf";
	if (lower.includes("final") || lower.includes("third")) return "final";
	return null;
}

function parseFinalLabel(round: string): string {
	const lower = round.toLowerCase();
	if (lower.includes("third") || lower.includes("3rd")) return "Third Place";
	if (lower.includes("final")) return "Final";
	return round;
}

function buildEmptyKnockout(): Record<WcKnockoutStage, WcKnockoutMatch[]> {
	return {
		r32: [],
		r16: [],
		qf: [],
		sf: [],
		final: [],
	};
}

function compareGroupName(a: string, b: string): number {
	const aMatch = a.match(/^Group\s+([A-Z])$/i);
	const bMatch = b.match(/^Group\s+([A-Z])$/i);
	if (aMatch && bMatch) {
		return aMatch[1].localeCompare(bMatch[1]);
	}
	return a.localeCompare(b);
}

export const WorldCupService = {
	async getTournamentData(): Promise<WorldCupData> {
		try {
			const rows = await prisma.match.findMany({
				where: {
					leagueSeason: 2026,
					leagueName: {
						contains: "World Cup",
						mode: "insensitive",
					},
				},
				orderBy: { date: "asc" },
				select: {
					id: true,
					round: true,
					date: true,
					statusShort: true,
					homeTeamName: true,
					homeTeamLogo: true,
					awayTeamName: true,
					awayTeamLogo: true,
					homeTeamWinner: true,
					awayTeamWinner: true,
					goalsHome: true,
					goalsAway: true,
					fulltimeHome: true,
					fulltimeAway: true,
				},
			});

			if (rows.length === 0) {
				return { groups: [], knockout: buildEmptyKnockout() };
			}

			const groupMap = new Map<string, Map<string, WcTeam>>();
			const knockout = buildEmptyKnockout();

			for (const row of rows) {
				const groupName = parseGroupName(row.round);
				if (groupName) {
					const teams = groupMap.get(groupName) ?? new Map<string, WcTeam>();
					const home = teams.get(row.homeTeamName) ?? {
						name: row.homeTeamName,
						flag: row.homeTeamLogo || getTeamFlag(row.homeTeamName),
						played: 0,
						goalsFor: 0,
						goalsAgainst: 0,
						points: 0,
					};
					const away = teams.get(row.awayTeamName) ?? {
						name: row.awayTeamName,
						flag: row.awayTeamLogo || getTeamFlag(row.awayTeamName),
						played: 0,
						goalsFor: 0,
						goalsAgainst: 0,
						points: 0,
					};

					if (isFinishedStatus(row.statusShort)) {
						const homeGoals = row.fulltimeHome ?? row.goalsHome;
						const awayGoals = row.fulltimeAway ?? row.goalsAway;

						if (homeGoals !== null && awayGoals !== null) {
							home.played += 1;
							away.played += 1;
							home.goalsFor += homeGoals;
							home.goalsAgainst += awayGoals;
							away.goalsFor += awayGoals;
							away.goalsAgainst += homeGoals;

							if (homeGoals > awayGoals) {
								home.points += 3;
							} else if (awayGoals > homeGoals) {
								away.points += 3;
							} else {
								home.points += 1;
								away.points += 1;
							}
						}
					}

					teams.set(home.name, home);
					teams.set(away.name, away);
					groupMap.set(groupName, teams);
					continue;
				}

				const stage = parseKnockoutStage(row.round);
				if (!stage) continue;

				knockout[stage].push({
					id: String(row.id),
					label: stage === "final" ? parseFinalLabel(row.round) : undefined,
					home: {
						name: row.homeTeamName,
						flag: row.homeTeamLogo || getTeamFlag(row.homeTeamName),
					},
					away: {
						name: row.awayTeamName,
						flag: row.awayTeamLogo || getTeamFlag(row.awayTeamName),
					},
					scoreHome: row.fulltimeHome ?? row.goalsHome ?? 0,
					scoreAway: row.fulltimeAway ?? row.goalsAway ?? 0,
					winner:
						row.homeTeamWinner === true
							? "home"
							: row.awayTeamWinner === true
								? "away"
								: undefined,
					date: toShortDate(row.date),
					time: toTime(row.date),
				});
			}

			const groups: WcGroup[] = [...groupMap.entries()]
				.sort((a, b) => compareGroupName(a[0], b[0]))
				.map(([name, teams]) => ({ name, teams: [...teams.values()] }));

			return { groups, knockout };
		} catch (err) {
			console.error("[WorldCupService.getTournamentData]", err);
			return { groups: [], knockout: buildEmptyKnockout() };
		}
	},
};
