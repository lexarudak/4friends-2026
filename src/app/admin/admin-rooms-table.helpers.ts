import type { RoomItem, TableRow } from "@/types/api";
import { getTournamentLabel } from "@/lib/tournaments";

export function mapRoomsToTableRows(rooms: RoomItem[]): TableRow[] {
	return rooms.map((room, index) => ({
		position: index + 1,
		name: room.name,
		score: 0,
		tag: room.password ?? "—",
		status: getTournamentLabel(room.tournament ?? "wc2026"),
	}));
}
