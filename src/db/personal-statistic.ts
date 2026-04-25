export type PersonalStat = {
	label: string;
	value: string | number;
	sub?: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "highlight" | "warm";
};

export const PERSONAL_STATS: PersonalStat[] = [
	{ label: "Total Score", value: 101, size: "lg", variant: "highlight" },
	{ label: "Exact Score Hits", value: 6, size: "lg" },
	{ label: "Predicted Wins", value: 8 },
	{ label: "Avg Points per Match", value: 2 },
	{
		label: "Favorite Team",
		value: "Canada",
		sub: "5 pts",
		variant: "warm",
		size: "lg",
	},
	{ label: "Favorite Score", value: "2 : 1", sub: "10 pts", variant: "warm" },
	{ label: "Best Day", value: "21 Jun", sub: "10 pts", variant: "warm" },
];
