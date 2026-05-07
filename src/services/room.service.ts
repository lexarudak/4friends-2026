import { prisma } from "@/lib/prisma";

export const RoomService = {
	async getUserRooms(userId: string): Promise<string[]> {
		try {
			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user?.currentRoom) return [];
			return [user.currentRoom];
		} catch (err) {
			console.error("[RoomService.getUserRooms]", err);
			return [];
		}
	},

	async getAllRooms() {
		try {
			return await prisma.room.findMany({ orderBy: { name: "asc" } });
		} catch (err) {
			console.error("[RoomService.getAllRooms]", err);
			return [];
		}
	},

	async getRoomByName(name: string) {
		try {
			return await prisma.room.findUnique({ where: { name } });
		} catch (err) {
			console.error("[RoomService.getRoomByName]", err);
			return null;
		}
	},

	async createRoom(name: string) {
		return prisma.room.create({ data: { name } });
	},
};
