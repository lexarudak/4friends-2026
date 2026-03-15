export type SmallTable = {
	room_id: string;
	players: string[];
};

export const TableService = {
	async getSmallTable(): Promise<SmallTable | null> {
		return null; // TODO: replace with real DB lookup
	},
};
