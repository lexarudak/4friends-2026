import { prisma } from "@/lib/prisma";

export const RoomService = {
	async getUserRooms(userId: string): Promise<string[]> {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user?.currentRoom) return [];
		return [user.currentRoom];
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
