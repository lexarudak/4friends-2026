import type { TableRow } from "@/types/api";

export type StatSection = {
	title: string;
	rows: TableRow[];
};

const CURRENT_USER_PLACEHOLDER = "me";

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
	"max",
	"elena",
	"dima",
	"olga",
	"sergei",
	"katya",
	"andrei",
	"masha",
	"felix",
	"hanna",
	"luca",
	"pierre",
	"carlos",
	"amara",
	"yuki",
	"ali",
	"priya",
	"noah",
];

function makeRows(scores: number[], currentUserName: string): TableRow[] {
	return scores
		.map((score, i) => {
			const name =
				names[i] === CURRENT_USER_PLACEHOLDER ? currentUserName : names[i];
			return {
				name,
				score,
				position: 0,
				isCurrentUser: names[i] === CURRENT_USER_PLACEHOLDER,
			};
		})
		.sort((a, b) => b.score - a.score)
		.map((row, i) => ({ ...row, position: i + 1 }));
}

export function getGlobalTopSections(currentUserName: string): StatSection[] {
	return [
		{
			title: "Total Score",
			rows: makeRows(
				[
					312, 289, 274, 261, 248, 235, 221, 208, 197, 184, 173, 162, 154, 143,
					138, 127, 119, 108, 97, 89, 81, 74, 66, 59, 51, 44, 37, 29, 18, 9,
				],
				currentUserName
			),
		},
		{
			title: "Exact Score Hits",
			rows: makeRows(
				[
					38, 34, 31, 29, 27, 25, 23, 21, 19, 18, 16, 15, 14, 13, 12, 11, 10, 9,
					8, 7, 6, 6, 5, 5, 4, 3, 3, 2, 1, 0,
				],
				currentUserName
			),
		},
		{
			title: "Predicted Wins",
			rows: makeRows(
				[
					51, 47, 44, 41, 38, 35, 33, 30, 28, 26, 24, 22, 21, 19, 18, 17, 15,
					14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2,
				],
				currentUserName
			),
		},
		{
			title: "Average Points per Match",
			rows: makeRows(
				[
					4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
					1, 1, 1, 1, 0, 0, 0,
				],
				currentUserName
			),
		},
	];
}
