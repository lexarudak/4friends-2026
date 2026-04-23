import * as MatchesDb from "@/db/matches";
import type { Match } from "@/types/api";

export const MatchService = {
	getMatches(): Match[] {
		return MatchesDb.getMatches();
	},
};
