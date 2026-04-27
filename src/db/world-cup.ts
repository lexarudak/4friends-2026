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
			team("Mexico", "🇲🇽"),
			team("South Africa", "🇿🇦"),
			team("Korea Republic", "🇰🇷"),
			team("Czechia", "🇨🇿"),
		],
	},
	{
		name: "Group B",
		teams: [
			team("Canada", "🇨🇦"),
			team("Bosnia-Herzegovina", "🇧🇦"),
			team("Qatar", "🇶🇦"),
			team("Switzerland", "🇨🇭"),
		],
	},
	{
		name: "Group C",
		teams: [
			team("Brazil", "🇧🇷"),
			team("Morocco", "🇲🇦"),
			team("Haiti", "🇭🇹"),
			team("Scotland", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"),
		],
	},
	{
		name: "Group D",
		teams: [
			team("USA", "🇺🇸"),
			team("Paraguay", "🇵🇾"),
			team("Australia", "🇦🇺"),
			team("Türkiye", "🇹🇷"),
		],
	},
	{
		name: "Group E",
		teams: [
			team("Germany", "🇩🇪"),
			team("Curaçao", "🇨🇼"),
			team("Côte d'Ivoire", "🇨🇮"),
			team("Ecuador", "🇪🇨"),
		],
	},
	{
		name: "Group F",
		teams: [
			team("Netherlands", "🇳🇱"),
			team("Japan", "🇯🇵"),
			team("Sweden", "🇸🇪"),
			team("Tunisia", "🇹🇳"),
		],
	},
	{
		name: "Group G",
		teams: [
			team("Belgium", "🇧🇪"),
			team("Egypt", "🇪🇬"),
			team("IR Iran", "🇮🇷"),
			team("New Zealand", "🇳🇿"),
		],
	},
	{
		name: "Group H",
		teams: [
			team("Spain", "🇪🇸"),
			team("Cabo Verde", "🇨🇻"),
			team("Saudi Arabia", "🇸🇦"),
			team("Uruguay", "🇺🇾"),
		],
	},
	{
		name: "Group I",
		teams: [
			team("France", "🇫🇷"),
			team("Senegal", "🇸🇳"),
			team("Iraq", "🇮🇶"),
			team("Norway", "🇳🇴"),
		],
	},
	{
		name: "Group J",
		teams: [
			team("Argentina", "🇦🇷"),
			team("Algeria", "🇩🇿"),
			team("Austria", "🇦🇹"),
			team("Jordan", "🇯🇴"),
		],
	},
	{
		name: "Group K",
		teams: [
			team("Portugal", "🇵🇹"),
			team("Congo DR", "🇨🇩"),
			team("Uzbekistan", "🇺🇿"),
			team("Colombia", "🇨🇴"),
		],
	},
	{
		name: "Group L",
		teams: [
			team("England", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"),
			team("Croatia", "🇭🇷"),
			team("Ghana", "🇬🇭"),
			team("Panama", "🇵🇦"),
		],
	},
];
