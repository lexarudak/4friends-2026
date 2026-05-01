import * as RoomsDb from "@/db/rooms";
import { prisma } from "@/lib/prisma";

export const RoomService = {
	async getUserRooms(userId: string): Promise<string[]> {
		return RoomsDb.getUserRooms(userId);
	},

	async addRoom(userId: string, roomId: string): Promise<string[]> {
		return RoomsDb.addUserRoom(userId, roomId);
	},

	async getAllRooms() {
		return prisma.room.findMany({ orderBy: { name: "asc" } });
	},

	async getRoomByName(name: string) {
		return prisma.room.findUnique({ where: { name } });
	},

	async createRoom(name: string) {
		return prisma.room.create({ data: { name } });
	},
};
