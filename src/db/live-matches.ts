export type LiveBet = {
	userId: string;
	name: string;
	betHome: number;
	betAway: number;
};

export type LiveMatch = {
	id: string;
	group: string;
	homeTeam: string;
	homeFlag: string;
	awayTeam: string;
	awayFlag: string;
	currentHome: number;
	currentAway: number;
	minute: number;
	bets: LiveBet[];
};

export function calcMatchPoints(
	betHome: number,
	betAway: number,
	currentHome: number,
	currentAway: number
): number {
	if (betHome === currentHome && betAway === currentAway) return 3;
	const betDiff = Math.sign(betHome - betAway);
	const curDiff = Math.sign(currentHome - currentAway);
	if (betDiff === curDiff) return 1;
	return 0;
}

const LIVE_MATCHES: LiveMatch[] = [
	{
		id: "live-1",
		group: "D",
		homeTeam: "Bosnia & Herzegovina",
		homeFlag: "🇧🇦",
		awayTeam: "Trinidad and Tobago",
		awayFlag: "🇹🇹",
		currentHome: 1,
		currentAway: 1,
		minute: 63,
		bets: [
			{ userId: "user-3", name: "kam", betHome: 1, betAway: 1 },
			{ userId: "user-1", name: "Val", betHome: 2, betAway: 1 },
			{ userId: "user-4", name: "valera", betHome: 0, betAway: 2 },
			{ userId: "user-5", name: "pete", betHome: 1, betAway: 0 },
			{ userId: "__current_user__", name: "me", betHome: 2, betAway: 0 },
			{ userId: "user-6", name: "anna", betHome: 1, betAway: 1 },
			{ userId: "user-7", name: "mike", betHome: 0, betAway: 1 },
			{ userId: "user-8", name: "lucas", betHome: 2, betAway: 2 },
			{ userId: "user-9", name: "sofia", betHome: 1, betAway: 2 },
			{ userId: "user-10", name: "igor", betHome: 3, betAway: 1 },
			{ userId: "user-11", name: "nina", betHome: 1, betAway: 1 },
			{ userId: "user-12", name: "tom", betHome: 0, betAway: 0 },
		],
	},
	{
		id: "live-2",
		group: "B",
		homeTeam: "Spain",
		homeFlag: "🇪🇸",
		awayTeam: "Italy",
		awayFlag: "🇮🇹",
		currentHome: 2,
		currentAway: 0,
		minute: 31,
		bets: [
			{ userId: "user-1", name: "Val", betHome: 2, betAway: 0 },
			{ userId: "user-3", name: "kam", betHome: 1, betAway: 0 },
			{ userId: "__current_user__", name: "me", betHome: 2, betAway: 1 },
			{ userId: "user-4", name: "valera", betHome: 0, betAway: 1 },
			{ userId: "user-5", name: "pete", betHome: 1, betAway: 1 },
			{ userId: "user-6", name: "anna", betHome: 3, betAway: 0 },
			{ userId: "user-7", name: "mike", betHome: 2, betAway: 0 },
			{ userId: "user-8", name: "lucas", betHome: 1, betAway: 2 },
		],
	},
];

export function getLiveMatches(): LiveMatch[] {
	return LIVE_MATCHES;
}
