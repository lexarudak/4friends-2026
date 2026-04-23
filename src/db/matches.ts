import type { Match } from "@/types/api";

export const matches: Match[] = [
	{
		id: "match-1",
		group: "Group A",
		time: "18:00",
		date: "14/06/26",
		home: { name: "Germany", flag: "🇩🇪" },
		away: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
	},
	{
		id: "match-2",
		group: "Group B",
		time: "21:00",
		date: "15/06/26",
		home: { name: "Spain", flag: "🇪🇸" },
		away: { name: "Italy", flag: "🇮🇹" },
	},
	{
		id: "match-3",
		group: "Group C",
		time: "15:00",
		date: "16/06/26",
		home: { name: "France", flag: "🇫🇷" },
		away: { name: "Brazil", flag: "🇧🇷" },
	},
];

export function getMatches(): Match[] {
	return matches;
}
