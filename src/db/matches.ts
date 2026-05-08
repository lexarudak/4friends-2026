import type { Match } from "@/types/api";

export const matches: Match[] = [
	{
		id: "1",
		group: "Group A",
		time: "18:00",
		date: "14/06/26",
		home: { name: "Germany", flag: "🇩🇪" },
		away: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
	},
	{
		id: "2",
		group: "Group B",
		time: "21:00",
		date: "15/06/26",
		home: { name: "Spain", flag: "🇪🇸" },
		away: { name: "Italy", flag: "🇮🇹" },
	},
	{
		id: "3",
		group: "Group C",
		time: "15:00",
		date: "16/06/26",
		home: { name: "France", flag: "🇫🇷" },
		away: { name: "Brazil", flag: "🇧🇷" },
	},
	{
		id: "4",
		group: "1/8 Final",
		time: "19:00",
		date: "22/06/26",
		home: { name: "Portugal", flag: "🇵🇹" },
		away: { name: "Netherlands", flag: "🇳🇱" },
	},
	{
		id: "5",
		group: "Quarter Final",
		time: "20:00",
		date: "26/06/26",
		home: { name: "Argentina", flag: "🇦🇷" },
		away: { name: "England", flag: "🏴" },
	},
];

export function getMatches(): Match[] {
	return matches;
}
