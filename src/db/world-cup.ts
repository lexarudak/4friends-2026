export type WcTeam = {
	name: string;
	flag: string;
	played: number;
	goalsFor: number;
	goalsAgainst: number;
	points: number;
};

export type WcGroup = {
	name: string;
	teams: WcTeam[];
};

export type WcKnockoutStage = "r32" | "r16" | "qf" | "sf" | "final";

export type WcKnockoutMatch = {
	id: string;
	label?: string;
	home: { name: string; flag: string };
	away: { name: string; flag: string };
	scoreHome: number | null;
	scoreAway: number | null;
	winner?: "home" | "away";
	status?: "upcoming" | "live" | "finished";
	date: string;
	time: string;
};

const team = (
	name: string,
	flag: string,
	played = 0,
	goalsFor = 0,
	goalsAgainst = 0,
	points = 0
): WcTeam => ({ name, flag, played, goalsFor, goalsAgainst, points });

export const WC_GROUPS: WcGroup[] = [
	{
		name: "Group A",
		teams: [
			team("Mexico", "🇲🇽", 3, 6, 2, 7),
			team("South Africa", "🇿🇦", 3, 3, 4, 4),
			team("Korea Republic", "🇰🇷", 3, 4, 4, 4),
			team("Czechia", "🇨🇿", 3, 2, 5, 1),
		],
	},
	{
		name: "Group B",
		teams: [
			team("Canada", "🇨🇦", 3, 5, 3, 6),
			team("Bosnia-Herzegovina", "🇧🇦", 3, 4, 3, 5),
			team("Qatar", "🇶🇦", 3, 3, 4, 4),
			team("Switzerland", "🇨🇭", 3, 2, 4, 1),
		],
	},
	{
		name: "Group C",
		teams: [
			team("Brazil", "🇧🇷", 3, 7, 2, 7),
			team("Morocco", "🇲🇦", 3, 4, 2, 6),
			team("Haiti", "🇭🇹", 3, 2, 5, 2),
			team("Scotland", "🏴", 3, 1, 5, 1),
		],
	},
	{
		name: "Group D",
		teams: [
			team("USA", "🇺🇸", 3, 6, 3, 6),
			team("Paraguay", "🇵🇾", 3, 4, 3, 5),
			team("Australia", "🇦🇺", 3, 3, 4, 4),
			team("Türkiye", "🇹🇷", 3, 2, 5, 1),
		],
	},
	{
		name: "Group E",
		teams: [
			team("Germany", "🇩🇪", 3, 8, 2, 9),
			team("Curaçao", "🇨🇼", 3, 3, 5, 3),
			team("Côte d'Ivoire", "🇨🇮", 3, 3, 4, 4),
			team("Ecuador", "🇪🇨", 3, 4, 7, 1),
		],
	},
	{
		name: "Group F",
		teams: [
			team("Netherlands", "🇳🇱", 3, 5, 2, 7),
			team("Japan", "🇯🇵", 3, 4, 2, 6),
			team("Sweden", "🇸🇪", 3, 3, 4, 4),
			team("Tunisia", "🇹🇳", 3, 1, 5, 0),
		],
	},
	{
		name: "Group G",
		teams: [
			team("Belgium", "🇧🇪", 3, 6, 2, 7),
			team("Egypt", "🇪🇬", 3, 4, 4, 4),
			team("IR Iran", "🇮🇷", 3, 3, 3, 5),
			team("New Zealand", "🇳🇿", 3, 2, 6, 0),
		],
	},
	{
		name: "Group H",
		teams: [
			team("Spain", "🇪🇸", 3, 7, 3, 7),
			team("Cabo Verde", "🇨🇻", 3, 2, 5, 1),
			team("Saudi Arabia", "🇸🇦", 3, 3, 5, 3),
			team("Uruguay", "🇺🇾", 3, 5, 4, 6),
		],
	},
	{
		name: "Group I",
		teams: [
			team("France", "🇫🇷", 3, 6, 2, 7),
			team("Senegal", "🇸🇳", 3, 4, 3, 6),
			team("Iraq", "🇮🇶", 3, 2, 4, 2),
			team("Norway", "🇳🇴", 3, 2, 5, 1),
		],
	},
	{
		name: "Group J",
		teams: [
			team("Argentina", "🇦🇷", 3, 8, 2, 9),
			team("Algeria", "🇩🇿", 3, 3, 4, 3),
			team("Austria", "🇦🇹", 3, 4, 4, 4),
			team("Jordan", "🇯🇴", 3, 1, 6, 1),
		],
	},
	{
		name: "Group K",
		teams: [
			team("Portugal", "🇵🇹", 3, 5, 1, 7),
			team("Congo DR", "🇨🇩", 3, 2, 5, 1),
			team("Uzbekistan", "🇺🇿", 3, 2, 4, 3),
			team("Colombia", "🇨🇴", 3, 4, 3, 6),
		],
	},
	{
		name: "Group L",
		teams: [
			team("England", "🏴", 3, 6, 2, 7),
			team("Croatia", "🇭🇷", 3, 5, 3, 6),
			team("Ghana", "🇬🇭", 3, 3, 4, 4),
			team("Panama", "🇵🇦", 3, 1, 6, 0),
		],
	},
];

export const WC_KNOCKOUT: Record<WcKnockoutStage, WcKnockoutMatch[]> = {
	r32: [
		{
			id: "r32-1",
			home: { name: "Mexico", flag: "🇲🇽" },
			away: { name: "Bosnia-Herzegovina", flag: "🇧🇦" },
			scoreHome: 2,
			scoreAway: 0,
			date: "28/06/26",
			time: "17:00",
		},
		{
			id: "r32-2",
			home: { name: "Brazil", flag: "🇧🇷" },
			away: { name: "Qatar", flag: "🇶🇦" },
			scoreHome: 3,
			scoreAway: 1,
			date: "28/06/26",
			time: "21:00",
		},
		{
			id: "r32-3",
			home: { name: "USA", flag: "🇺🇸" },
			away: { name: "Scotland", flag: "🏴" },
			scoreHome: 1,
			scoreAway: 0,
			date: "29/06/26",
			time: "17:00",
		},
		{
			id: "r32-4",
			home: { name: "Germany", flag: "🇩🇪" },
			away: { name: "Australia", flag: "🇦🇺" },
			scoreHome: 2,
			scoreAway: 1,
			date: "29/06/26",
			time: "21:00",
		},
		{
			id: "r32-5",
			home: { name: "Netherlands", flag: "🇳🇱" },
			away: { name: "Ecuador", flag: "🇪🇨" },
			scoreHome: 2,
			scoreAway: 0,
			date: "30/06/26",
			time: "17:00",
		},
		{
			id: "r32-6",
			home: { name: "Belgium", flag: "🇧🇪" },
			away: { name: "Tunisia", flag: "🇹🇳" },
			scoreHome: 1,
			scoreAway: 0,
			date: "30/06/26",
			time: "21:00",
		},
		{
			id: "r32-7",
			home: { name: "Spain", flag: "🇪🇸" },
			away: { name: "Egypt", flag: "🇪🇬" },
			scoreHome: 2,
			scoreAway: 1,
			date: "01/07/26",
			time: "17:00",
		},
		{
			id: "r32-8",
			home: { name: "France", flag: "🇫🇷" },
			away: { name: "Uruguay", flag: "🇺🇾" },
			scoreHome: 2,
			scoreAway: 2,
			date: "01/07/26",
			time: "21:00",
		},
		{
			id: "r32-9",
			home: { name: "Argentina", flag: "🇦🇷" },
			away: { name: "Senegal", flag: "🇸🇳" },
			scoreHome: 2,
			scoreAway: 0,
			date: "02/07/26",
			time: "17:00",
		},
		{
			id: "r32-10",
			home: { name: "Portugal", flag: "🇵🇹" },
			away: { name: "Austria", flag: "🇦🇹" },
			scoreHome: 1,
			scoreAway: 0,
			date: "02/07/26",
			time: "21:00",
		},
		{
			id: "r32-11",
			home: { name: "England", flag: "🏴" },
			away: { name: "Colombia", flag: "🇨🇴" },
			scoreHome: 3,
			scoreAway: 2,
			date: "03/07/26",
			time: "17:00",
		},
		{
			id: "r32-12",
			home: { name: "Croatia", flag: "🇭🇷" },
			away: { name: "Paraguay", flag: "🇵🇾" },
			scoreHome: 2,
			scoreAway: 1,
			date: "03/07/26",
			time: "21:00",
		},
		{
			id: "r32-13",
			home: { name: "Switzerland", flag: "🇨🇭" },
			away: { name: "Türkiye", flag: "🇹🇷" },
			scoreHome: 1,
			scoreAway: 0,
			date: "04/07/26",
			time: "17:00",
		},
		{
			id: "r32-14",
			home: { name: "Japan", flag: "🇯🇵" },
			away: { name: "Norway", flag: "🇳🇴" },
			scoreHome: 2,
			scoreAway: 1,
			date: "04/07/26",
			time: "21:00",
		},
		{
			id: "r32-15",
			home: { name: "Morocco", flag: "🇲🇦" },
			away: { name: "Saudi Arabia", flag: "🇸🇦" },
			scoreHome: 1,
			scoreAway: 0,
			date: "05/07/26",
			time: "17:00",
		},
		{
			id: "r32-16",
			home: { name: "Canada", flag: "🇨🇦" },
			away: { name: "Korea Republic", flag: "🇰🇷" },
			scoreHome: 0,
			scoreAway: 1,
			date: "05/07/26",
			time: "21:00",
		},
	],
	r16: [
		{
			id: "r16-1",
			home: { name: "Mexico", flag: "🇲🇽" },
			away: { name: "Brazil", flag: "🇧🇷" },
			scoreHome: 1,
			scoreAway: 2,
			date: "06/07/26",
			time: "18:00",
		},
		{
			id: "r16-2",
			home: { name: "USA", flag: "🇺🇸" },
			away: { name: "Germany", flag: "🇩🇪" },
			scoreHome: 1,
			scoreAway: 1,
			date: "06/07/26",
			time: "22:00",
		},
		{
			id: "r16-3",
			home: { name: "Netherlands", flag: "🇳🇱" },
			away: { name: "Belgium", flag: "🇧🇪" },
			scoreHome: 2,
			scoreAway: 1,
			date: "07/07/26",
			time: "18:00",
		},
		{
			id: "r16-4",
			home: { name: "Spain", flag: "🇪🇸" },
			away: { name: "France", flag: "🇫🇷" },
			scoreHome: 1,
			scoreAway: 2,
			date: "07/07/26",
			time: "22:00",
		},
		{
			id: "r16-5",
			home: { name: "Argentina", flag: "🇦🇷" },
			away: { name: "Portugal", flag: "🇵🇹" },
			scoreHome: 2,
			scoreAway: 1,
			date: "08/07/26",
			time: "18:00",
		},
		{
			id: "r16-6",
			home: { name: "England", flag: "🏴" },
			away: { name: "Croatia", flag: "🇭🇷" },
			scoreHome: 1,
			scoreAway: 0,
			date: "08/07/26",
			time: "22:00",
		},
		{
			id: "r16-7",
			home: { name: "Switzerland", flag: "🇨🇭" },
			away: { name: "Japan", flag: "🇯🇵" },
			scoreHome: 0,
			scoreAway: 1,
			date: "09/07/26",
			time: "18:00",
		},
		{
			id: "r16-8",
			home: { name: "Morocco", flag: "🇲🇦" },
			away: { name: "Korea Republic", flag: "🇰🇷" },
			scoreHome: 1,
			scoreAway: 0,
			date: "09/07/26",
			time: "22:00",
		},
	],
	qf: [
		{
			id: "qf-1",
			home: { name: "Brazil", flag: "🇧🇷" },
			away: { name: "Germany", flag: "🇩🇪" },
			scoreHome: 2,
			scoreAway: 1,
			date: "11/07/26",
			time: "18:00",
		},
		{
			id: "qf-2",
			home: { name: "Netherlands", flag: "🇳🇱" },
			away: { name: "France", flag: "🇫🇷" },
			scoreHome: 1,
			scoreAway: 2,
			date: "11/07/26",
			time: "22:00",
		},
		{
			id: "qf-3",
			home: { name: "Argentina", flag: "🇦🇷" },
			away: { name: "England", flag: "🏴" },
			scoreHome: 1,
			scoreAway: 0,
			date: "12/07/26",
			time: "18:00",
		},
		{
			id: "qf-4",
			home: { name: "Japan", flag: "🇯🇵" },
			away: { name: "Morocco", flag: "🇲🇦" },
			scoreHome: 0,
			scoreAway: 1,
			date: "12/07/26",
			time: "22:00",
		},
	],
	sf: [
		{
			id: "sf-1",
			home: { name: "Brazil", flag: "🇧🇷" },
			away: { name: "France", flag: "🇫🇷" },
			scoreHome: 1,
			scoreAway: 2,
			date: "15/07/26",
			time: "21:00",
		},
		{
			id: "sf-2",
			home: { name: "Argentina", flag: "🇦🇷" },
			away: { name: "Morocco", flag: "🇲🇦" },
			scoreHome: 2,
			scoreAway: 0,
			date: "16/07/26",
			time: "21:00",
		},
	],
	final: [
		{
			id: "f-3rd",
			label: "Third Place",
			home: { name: "Brazil", flag: "🇧🇷" },
			away: { name: "Morocco", flag: "🇲🇦" },
			scoreHome: 2,
			scoreAway: 1,
			date: "18/07/26",
			time: "18:00",
		},
		{
			id: "f-final",
			label: "Final",
			home: { name: "France", flag: "🇫🇷" },
			away: { name: "Argentina", flag: "🇦🇷" },
			scoreHome: 2,
			scoreAway: 2,
			winner: "away",
			date: "19/07/26",
			time: "19:00",
		},
	],
};
