import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

function isUserRoomUnavailable(err: unknown): boolean {
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		return err.code === "P2021";
	}

	const msg = err instanceof Error ? err.message : String(err);
	return msg.toLowerCase().includes("userroom");
}

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
			if (isUserRoomUnavailable(err)) {
				try {
					const user = await prisma.user.findUnique({ where: { id: userId } });
					return user?.currentRoom ? [user.currentRoom] : [];
				} catch (fallbackErr) {
					console.error(
						"[RoomService.getUserRooms:legacyFallback]",
						fallbackErr
					);
					return [];
				}
			}

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
			if (isUserRoomUnavailable(err)) {
				try {
					await prisma.$transaction(async (tx) => {
						const room = await tx.room.findUnique({
							where: { name: roomName },
						});
						if (!room) return;

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
					});

					return true;
				} catch (fallbackErr) {
					console.error(
						"[RoomService.joinRoomAndSetCurrent:legacyFallback]",
						fallbackErr
					);
					return false;
				}
			}

			console.error("[RoomService.joinRoomAndSetCurrent]", err);
			return false;
		}
	},

	async createRoom(name: string) {
		return prisma.room.create({ data: { name } });
	},
};
