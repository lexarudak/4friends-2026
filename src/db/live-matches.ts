import type { ScheduleMatch } from "@/components/widgets/schedule-match-card";

export type { ScheduleMatch as LiveMatch };

function pts(betHome: number, betAway: number, rh: number, ra: number): number {
	if (betHome === rh && betAway === ra) return 3;
	if (Math.sign(betHome - betAway) === Math.sign(rh - ra)) return 1;
	return 0;
}

const LIVE_MATCHES: ScheduleMatch[] = [
	{
		id: "live-1",
		group: "Group D",
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
				points: pts(1, 1, 1, 1),
			},
			{
				userId: "user-1",
				name: "Val",
				betHome: 2,
				betAway: 1,
				points: pts(2, 1, 1, 1),
			},
			{
				userId: "user-4",
				name: "valera",
				betHome: 0,
				betAway: 2,
				points: pts(0, 2, 1, 1),
			},
			{
				userId: "user-5",
				name: "pete",
				betHome: 1,
				betAway: 0,
				points: pts(1, 0, 1, 1),
			},
			{
				userId: "__current_user__",
				name: "me",
				betHome: 2,
				betAway: 0,
				points: pts(2, 0, 1, 1),
			},
			{
				userId: "user-6",
				name: "anna",
				betHome: 1,
				betAway: 1,
				points: pts(1, 1, 1, 1),
			},
			{
				userId: "user-7",
				name: "mike",
				betHome: 0,
				betAway: 1,
				points: pts(0, 1, 1, 1),
			},
			{
				userId: "user-8",
				name: "lucas",
				betHome: 2,
				betAway: 2,
				points: pts(2, 2, 1, 1),
			},
			{
				userId: "user-9",
				name: "sofia",
				betHome: 1,
				betAway: 2,
				points: pts(1, 2, 1, 1),
			},
			{
				userId: "user-10",
				name: "igor",
				betHome: 3,
				betAway: 1,
				points: pts(3, 1, 1, 1),
			},
			{
				userId: "user-11",
				name: "nina",
				betHome: 1,
				betAway: 1,
				points: pts(1, 1, 1, 1),
			},
			{
				userId: "user-12",
				name: "tom",
				betHome: 0,
				betAway: 0,
				points: pts(0, 0, 1, 1),
			},
		],
	},
	{
		id: "live-2",
		group: "Group B",
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
				points: pts(2, 0, 2, 0),
			},
			{
				userId: "user-3",
				name: "kam",
				betHome: 1,
				betAway: 0,
				points: pts(1, 0, 2, 0),
			},
			{
				userId: "__current_user__",
				name: "me",
				betHome: 2,
				betAway: 1,
				points: pts(2, 1, 2, 0),
			},
			{
				userId: "user-4",
				name: "valera",
				betHome: 0,
				betAway: 1,
				points: pts(0, 1, 2, 0),
			},
			{
				userId: "user-5",
				name: "pete",
				betHome: 1,
				betAway: 1,
				points: pts(1, 1, 2, 0),
			},
			{
				userId: "user-6",
				name: "anna",
				betHome: 3,
				betAway: 0,
				points: pts(3, 0, 2, 0),
			},
			{
				userId: "user-7",
				name: "mike",
				betHome: 2,
				betAway: 0,
				points: pts(2, 0, 2, 0),
			},
			{
				userId: "user-8",
				name: "lucas",
				betHome: 1,
				betAway: 2,
				points: pts(1, 2, 2, 0),
			},
		],
	},
];

export function getLiveMatches(): ScheduleMatch[] {
	return LIVE_MATCHES;
}
