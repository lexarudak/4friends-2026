// Mock scores: roomId -> array of { userId, name, score }
type ScoreEntry = {
	userId: string;
	name: string;
	score: number;
};

const store: Map<string, ScoreEntry[]> = new Map([
	[
		"default",
		[
			{ userId: "user-1", name: "Val", score: 101 },
			{
				userId: "user-2",
				name: "Konstantinos Papadopoulos-Alexandropoulos",
				score: 94,
			},
			{ userId: "user-3", name: "valera", score: 44 },
			{ userId: "user-4", name: "pete", score: 38 },
			{ userId: "__current_user__", name: "me", score: 27 },
			{ userId: "user-6", name: "anna", score: 21 },
			{ userId: "user-7", name: "mike", score: 15 },
			{ userId: "user-8", name: "lucas", score: 13 },
			{ userId: "user-9", name: "sofia", score: 11 },
			{ userId: "user-10", name: "igor", score: 9 },
			{ userId: "user-11", name: "nina", score: 7 },
			{ userId: "user-12", name: "tom", score: 4 },
		],
	],
]);

export function getRoomScores(roomId: string): ScoreEntry[] {
	return store.get(roomId) ?? store.get("default") ?? [];
}
