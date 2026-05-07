import type { RoomItem, TableRow } from "@/types/api";

export function mapRoomsToTableRows(rooms: RoomItem[]): TableRow[] {
	return rooms.map((room, index) => ({
		position: index + 1,
		name: room.name,
		score: 0,
		tag: room.id.slice(0, 6),
	}));
}
