import type { RoomItem, TableRow } from "@/types/api";

const TOURNAMENT_LABELS: Record<string, string> = {
	wc2026: "WC 2026",
	ucl2526: "UCL 25/26",
};

export function mapRoomsToTableRows(rooms: RoomItem[]): TableRow[] {
	return rooms.map((room, index) => ({
		position: index + 1,
		name: room.name,
		score: 0,
		tag: room.password ?? "—",
		status: TOURNAMENT_LABELS[room.tournament ?? "wc2026"] ?? room.tournament,
	}));
}
