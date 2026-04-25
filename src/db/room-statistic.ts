import type { TableRow } from "@/types/api";

export type StatSection = {
	title: string;
	rows: TableRow[];
};

const names = [
	"Val",
	"Konstantinos Papadopoulos-Alexandropoulos",
	"valera",
	"pete",
	"me",
	"anna",
	"mike",
	"lucas",
	"sofia",
	"igor",
	"nina",
	"tom",
];

const CURRENT_USER_PLACEHOLDER = "me";

function makeRows(scores: number[], currentUserName: string): TableRow[] {
	return scores
		.map((score, i) => {
			const name = names[i] === CURRENT_USER_PLACEHOLDER ? currentUserName : names[i];
			return { name, score, position: 0, isCurrentUser: names[i] === CURRENT_USER_PLACEHOLDER };
		})
		.sort((a, b) => b.score - a.score)
		.map((row, i) => ({ ...row, position: i + 1 }));
}

export function getStatSections(currentUserName: string): StatSection[] {
	return [
		{
			title: "Total Score",
			rows: makeRows([101, 94, 44, 38, 27, 21, 15, 13, 11, 9, 7, 4], currentUserName),
		},
		{
			title: "Exact Score Hits",
			rows: makeRows([10, 5, 2, 4, 120, 1, 6, 0, 2, 1, 3, 0], currentUserName),
		},
		{
			title: "Predicted Wins",
			rows: makeRows([10, 15, 5, 7, 4, 3, 8, 2, 6, 1, 3, 0], currentUserName),
		},
		{
			title: "Average Points per Match",
			rows: makeRows([2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], currentUserName),
		},
	];
}
