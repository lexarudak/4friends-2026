/**
 * Central tournament registry.
 * Each tournament maps to an api-football league + season so the sync layer
 * can tag incoming fixtures, and carries display metadata for the UI.
 */

export type TournamentConfig = {
	slug: string;
	label: string;
	leagueId: number;
	season: number;
};

export const TOURNAMENTS: Record<string, TournamentConfig> = {
	wc2026: {
		slug: "wc2026",
		label: "FIFA World Cup 2026",
		leagueId: 1,
		season: 2026,
	},
	ucl2526: {
		slug: "ucl2526",
		label: "UEFA Champions League 25/26",
		leagueId: 2,
		season: 2025,
	},
	belarus1: {
		slug: "belarus1",
		label: "Belarus First League",
		leagueId: 117,
		season: 2026,
	},
};

export const DEFAULT_TOURNAMENT = "wc2026";

export function getTournamentLabel(slug: string): string {
	return TOURNAMENTS[slug]?.label ?? slug;
}

/** Resolve which tournament slug a synced fixture belongs to, by league id. */
export function tournamentForLeague(leagueId: number): string | null {
	for (const cfg of Object.values(TOURNAMENTS)) {
		if (cfg.leagueId === leagueId) return cfg.slug;
	}
	return null;
}
