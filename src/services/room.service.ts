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
		return prisma.room.findUnique({ where: { name } });
	},

	async createRoom(name: string) {
		return prisma.room.create({ data: { name } });
	},
};
