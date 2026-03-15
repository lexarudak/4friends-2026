import * as RoomsDb from "@/db/rooms";

export const RoomService = {
	async getUserRooms(userId: string): Promise<string[]> {
		return RoomsDb.getUserRooms(userId);
	},

	async addRoom(userId: string, roomId: string): Promise<string[]> {
		return RoomsDb.addUserRoom(userId, roomId);
	},
};
