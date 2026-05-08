import type { ScheduleMatch } from "@/components/widgets/schedule-match-card";

export type { ScheduleMatch as LiveMatch };

function basePts(
	betHome: number,
	betAway: number,
	rh: number,
	ra: number
): number {
	if (betHome === rh && betAway === ra) return 3;
	if (betHome - betAway === rh - ra) return 2;
	if (Math.sign(betHome - betAway) === Math.sign(rh - ra)) return 1;
	return 0;
}

function totalPts(
	betHome: number,
	betAway: number,
	rh: number,
	ra: number,
	winPick?: "home" | "away" | null,
	isPlayoff = false
): number {
	const base = basePts(betHome, betAway, rh, ra);

	if (!isPlayoff || !winPick) return base;

	const winnerSide = rh > ra ? "home" : rh < ra ? "away" : null;
	if (!winnerSide) return base;

	return base + (winPick === winnerSide ? 2 : 0);
}

const LIVE_MATCHES: ScheduleMatch[] = [
	{
		id: "live-1",
		group: "Quarter-final",
		time: "",
		date: "",
		home: { name: "Bosnia & Herzegovina", flag: "🇧🇦" },
		away: { name: "Trinidad and Tobago", flag: "🇹🇹" },
		status: "live",
		resultHome: 1,
		resultAway: 1,
		minute: 63,
		bets: [
			{
				userId: "user-3",
				name: "kam",
				betHome: 1,
				betAway: 1,
				winPick: "home",
				points: totalPts(1, 1, 1, 1, "home", true),
			},
			{
				userId: "user-1",
				name: "Val",
				betHome: 2,
				betAway: 1,
				winPick: "away",
				points: totalPts(2, 1, 1, 1, "away", true),
			},
			{
				userId: "user-4",
				name: "valera",
				betHome: 0,
				betAway: 2,
				winPick: "away",
				points: totalPts(0, 2, 1, 1, "away", true),
			},
			{
				userId: "user-5",
				name: "pete",
				betHome: 1,
				betAway: 0,
				winPick: "home",
				points: totalPts(1, 0, 1, 1, "home", true),
			},
			{
				userId: "__current_user__",
				name: "me",
				betHome: 2,
				betAway: 0,
				winPick: "home",
				points: totalPts(2, 0, 1, 1, "home", true),
			},
			{
				userId: "user-6",
				name: "anna",
				betHome: 1,
				betAway: 1,
				winPick: "away",
				points: totalPts(1, 1, 1, 1, "away", true),
			},
			{
				userId: "user-7",
				name: "mike",
				betHome: 0,
				betAway: 1,
				winPick: "away",
				points: totalPts(0, 1, 1, 1, "away", true),
			},
			{
				userId: "user-8",
				name: "lucas",
				betHome: 2,
				betAway: 2,
				winPick: "home",
				points: totalPts(2, 2, 1, 1, "home", true),
			},
			{
				userId: "user-9",
				name: "sofia",
				betHome: 1,
				betAway: 2,
				winPick: "away",
				points: totalPts(1, 2, 1, 1, "away", true),
			},
			{
				userId: "user-10",
				name: "igor",
				betHome: 3,
				betAway: 1,
				winPick: "home",
				points: totalPts(3, 1, 1, 1, "home", true),
			},
			{
				userId: "user-11",
				name: "nina",
				betHome: 1,
				betAway: 1,
				winPick: "away",
				points: totalPts(1, 1, 1, 1, "away", true),
			},
			{
				userId: "user-12",
				name: "tom",
				betHome: 0,
				betAway: 0,
				winPick: "home",
				points: totalPts(0, 0, 1, 1, "home", true),
			},
		],
	},
	{
		id: "live-2",
		group: "Final",
		time: "",
		date: "",
		home: { name: "Spain", flag: "🇪🇸" },
		away: { name: "Italy", flag: "🇮🇹" },
		status: "live",
		resultHome: 2,
		resultAway: 0,
		minute: 31,
		bets: [
			{
				userId: "user-1",
				name: "Val",
				betHome: 2,
				betAway: 0,
				winPick: "home",
				points: totalPts(2, 0, 2, 0, "home", true),
			},
			{
				userId: "user-3",
				name: "kam",
				betHome: 1,
				betAway: 0,
				winPick: "home",
				points: totalPts(1, 0, 2, 0, "home", true),
			},
			{
				userId: "__current_user__",
				name: "me",
				betHome: 2,
				betAway: 1,
				winPick: "home",
				points: totalPts(2, 1, 2, 0, "home", true),
			},
			{
				userId: "user-4",
				name: "valera",
				betHome: 0,
				betAway: 1,
				winPick: "away",
				points: totalPts(0, 1, 2, 0, "away", true),
			},
			{
				userId: "user-5",
				name: "pete",
				betHome: 1,
				betAway: 1,
				winPick: "home",
				points: totalPts(1, 1, 2, 0, "home", true),
			},
			{
				userId: "user-6",
				name: "anna",
				betHome: 3,
				betAway: 0,
				winPick: "home",
				points: totalPts(3, 0, 2, 0, "home", true),
			},
			{
				userId: "user-7",
				name: "mike",
				betHome: 2,
				betAway: 0,
				winPick: "away",
				points: totalPts(2, 0, 2, 0, "away", true),
			},
			{
				userId: "user-8",
				name: "lucas",
				betHome: 1,
				betAway: 2,
				winPick: "away",
				points: totalPts(1, 2, 2, 0, "away", true),
			},
		],
	},
];

export function getLiveMatches(): ScheduleMatch[] {
	return LIVE_MATCHES;
}
