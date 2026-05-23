import { prisma } from "@/lib/prisma";

export const RoomService = {
	async getUserRooms(userId: string): Promise<string[]> {
		try {
			const memberships = await prisma.userRoom.findMany({
				where: { userId },
				include: {
					room: {
						select: { name: true },
					},
				},
				orderBy: { joinedAt: "asc" },
			});

			return memberships.map((membership) => membership.room.name);
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

	async joinRoomAndSetCurrent(
		userId: string,
		userName: string | null | undefined,
		roomName: string
	): Promise<boolean> {
		try {
			return await prisma.$transaction(async (tx) => {
				const room = await tx.room.findUnique({ where: { name: roomName } });
				if (!room) return false;

				await tx.user.upsert({
					where: { id: userId },
					update: {
						currentRoom: room.name,
						name: userName ?? undefined,
					},
					create: {
						id: userId,
						name: userName ?? null,
						currentRoom: room.name,
					},
				});

				await tx.userRoom.upsert({
					where: {
						userId_roomId: {
							userId,
							roomId: room.id,
						},
					},
					update: {},
					create: {
						userId,
						roomId: room.id,
					},
				});

				return true;
			});
		} catch (err) {
			console.error("[RoomService.joinRoomAndSetCurrent]", err);
			return false;
		}
	},

	async createRoom(name: string) {
		return prisma.room.create({ data: { name } });
	},
};
