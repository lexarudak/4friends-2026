import { prisma } from "@/lib/prisma";

export type DbUser = {
	current_room: string | null;
};

export const UserService = {
	async getUserById(id: string): Promise<DbUser | null> {
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) return null;
		return { current_room: user.currentRoom ?? null };
	},

	async addUser(id: string, userData: DbUser): Promise<DbUser> {
		const user = await prisma.user.upsert({
			where: { id },
			update: { currentRoom: userData.current_room },
			create: { id, currentRoom: userData.current_room },
		});
		return { current_room: user.currentRoom ?? null };
	},
};
