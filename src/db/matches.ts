import type { Match } from "@/types/api";

// Deprecated: matches are loaded from Prisma via MatchService.
export const matches: Match[] = [];

export function getMatches(): Match[] {
	return matches;
}
