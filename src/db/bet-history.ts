export type BetHistoryItem = {
	id: string;
	group: string;
	homeTeam: string;
	homeFlag: string;
	awayTeam: string;
	awayFlag: string;
	betHome: number;
	betAway: number;
	resultHome: number | null;
	resultAway: number | null;
	time: string;
	date: string;
	points: number | null;
};

export const BET_HISTORY: BetHistoryItem[] = [
	{
		id: "1",
		group: "A",
		homeTeam: "Germany",
		homeFlag: "🇩🇪",
		awayTeam: "Scotland",
		awayFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
		betHome: 2,
		betAway: 1,
		resultHome: 1,
		resultAway: 1,
		time: "18:00",
		date: "14/06/26",
		points: 0,
	},
	{
		id: "2",
		group: "B",
		homeTeam: "Spain",
		homeFlag: "🇪🇸",
		awayTeam: "Italy",
		awayFlag: "🇮🇹",
		betHome: 1,
		betAway: 1,
		resultHome: 1,
		resultAway: 1,
		time: "21:00",
		date: "15/06/26",
		points: 3,
	},
	{
		id: "3",
		group: "C",
		homeTeam: "France",
		homeFlag: "🇫🇷",
		awayTeam: "Brazil",
		awayFlag: "🇧🇷",
		betHome: 2,
		betAway: 0,
		resultHome: 2,
		resultAway: 0,
		time: "21:00",
		date: "16/06/26",
		points: 3,
	},
	{
		id: "4",
		group: "D",
		homeTeam: "Portugal",
		homeFlag: "🇵🇹",
		awayTeam: "Argentina",
		awayFlag: "🇦🇷",
		betHome: 1,
		betAway: 2,
		resultHome: 2,
		resultAway: 1,
		time: "18:00",
		date: "17/06/26",
		points: 0,
	},
	{
		id: "7",
		group: "G",
		homeTeam: "USA",
		homeFlag: "🇺🇸",
		awayTeam: "Mexico",
		awayFlag: "🇲🇽",
		betHome: 2,
		betAway: 1,
		resultHome: 1,
		resultAway: 0,
		time: "21:00",
		date: "20/06/26",
		points: 1,
	},
	{
		id: "5",
		group: "E",
		homeTeam: "England",
		homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
		awayTeam: "Netherlands",
		awayFlag: "🇳🇱",
		betHome: 1,
		betAway: 0,
		resultHome: null,
		resultAway: null,
		time: "21:00",
		date: "18/06/26",
		points: null,
	},
	{
		id: "6",
		group: "F",
		homeTeam: "Belgium",
		homeFlag: "🇧🇪",
		awayTeam: "Croatia",
		awayFlag: "🇭🇷",
		betHome: 2,
		betAway: 2,
		resultHome: null,
		resultAway: null,
		time: "18:00",
		date: "19/06/26",
		points: null,
	},
];
