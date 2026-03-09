import * as RoomsDb from "@/db/rooms";

export type Room = {
	room_id: string;
	is_active: boolean;
};

export class RoomService {
	static async getUserRooms(userId: string): Promise<Room[]> {
		return RoomsDb.getUserRooms(userId);
	}

	static async joinRoom(userId: string, roomId: string): Promise<Room[]> {
		const rooms = RoomsDb.getUserRooms(userId);

		const updated = rooms.map((room) => {
			return { ...room, is_active: room.room_id === roomId };
		});

		RoomsDb.setUserRooms(userId, updated);
		return updated;
	}
}
