import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type UserRoomDelegate = {
	findMany: (...args: unknown[]) => Promise<
		Array<{
			room: { name: string };
		}>
	>;
	upsert: (...args: unknown[]) => Promise<unknown>;
};

function getUserRoomDelegate(client: unknown): UserRoomDelegate | null {
	if (!client || typeof client !== "object") return null;
	const maybe = client as { userRoom?: unknown };
	if (!maybe.userRoom || typeof maybe.userRoom !== "object") return null;

	const delegate = maybe.userRoom as {
		findMany?: unknown;
		upsert?: unknown;
	};

	if (
		typeof delegate.findMany !== "function" ||
		typeof delegate.upsert !== "function"
	) {
		return null;
	}

	return delegate as UserRoomDelegate;
}

function isUserRoomUnavailable(err: unknown): boolean {
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		return err.code === "P2021";
	}

	if (
		err instanceof TypeError &&
		err.message.includes("Cannot read properties of undefined")
	) {
		return true;
	}

	const msg = err instanceof Error ? err.message : String(err);
	return msg.toLowerCase().includes("userroom");
}

export const RoomService = {
	async getUserRooms(userId: string): Promise<string[]> {
		const userRoom = getUserRoomDelegate(prisma);
		if (!userRoom) {
			try {
				const user = await prisma.user.findUnique({ where: { id: userId } });
				return user?.currentRoom ? [user.currentRoom] : [];
			} catch (fallbackErr) {
				console.error("[RoomService.getUserRooms:legacyFallback]", fallbackErr);
				return [];
			}
		}

		try {
			const memberships = await userRoom.findMany({
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
		const userRoom = getUserRoomDelegate(prisma);
		if (!userRoom) {
			try {
				await prisma.$transaction(async (tx) => {
					const room = await tx.room.findUnique({ where: { name: roomName } });
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

				const txUserRoom = getUserRoomDelegate(tx);
				if (!txUserRoom) throw new Error("UserRoom delegate unavailable");

				await txUserRoom.upsert({
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

	async createRoom(
		name: string,
		tournament = "wc2026",
		password?: string,
		imageUrl?: string
	) {
		return prisma.room.create({
			data: {
				name,
				tournament,
				password: password ?? null,
				imageUrl: imageUrl ?? null,
			},
		});
	},

	/**
	 * Delete a room and everything tied to it: bets (keyed by room name),
	 * memberships (UserRoom cascades on room delete), and clear it from any
	 * user's active room. Returns false if the room doesn't exist.
	 */
	async deleteRoom(name: string): Promise<boolean> {
		const room = await prisma.room.findUnique({ where: { name } });
		if (!room) return false;

		await prisma.$transaction([
			prisma.bet.deleteMany({ where: { roomId: name } }),
			prisma.user.updateMany({
				where: { currentRoom: name },
				data: { currentRoom: null },
			}),
			prisma.room.delete({ where: { name } }),
		]);
		return true;
	},
};
