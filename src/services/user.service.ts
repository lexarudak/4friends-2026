import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type DbUser = {
	name?: string | null;
	current_room: string | null;
};

function isDbUnreachable(err: unknown): boolean {
	if (err instanceof Prisma.PrismaClientKnownRequestError) return false;
	if (err instanceof Prisma.PrismaClientInitializationError) return true;
	if (err instanceof Prisma.PrismaClientRustPanicError) return true;
	const msg = err instanceof Error ? err.message : String(err);
	return msg.includes("Can't reach database") || msg.includes("ECONNREFUSED");
}

export class DbUnavailableError extends Error {
	constructor() {
		super("Database is unavailable. Please check your connection.");
		this.name = "DbUnavailableError";
	}
}

export const UserService = {
	async getUserById(id: string): Promise<DbUser | null> {
		try {
			const user = await prisma.user.findUnique({ where: { id } });
			if (!user) return null;
			return { current_room: user.currentRoom ?? null, name: user.name };
		} catch (err) {
			if (isDbUnreachable(err)) return null;
			throw err;
		}
	},

	async addUser(id: string, userData: DbUser): Promise<DbUser> {
		try {
			const user = await prisma.user.upsert({
				where: { id },
				update: { currentRoom: userData.current_room, name: userData.name },
				create: { id, name: userData.name, currentRoom: userData.current_room },
			});
			return { current_room: user.currentRoom ?? null, name: user.name };
		} catch (err) {
			if (isDbUnreachable(err)) throw new DbUnavailableError();
			throw err;
		}
	},

	async ensureNameSaved(id: string, name: string): Promise<void> {
		try {
			await prisma.user.updateMany({
				where: { id, name: null },
				data: { name },
			});
		} catch (err) {
			if (isDbUnreachable(err)) return;
			throw err;
		}
	},
};
