import * as UsersDb from "@/db/users";
import type { DbUser } from "@/db/users";

export type { DbUser };

export const UserService = {
	async getUserById(id: string): Promise<DbUser | null> {
		return UsersDb.getUserById(id);
	},

	async addUser(id: string, userData: DbUser): Promise<DbUser> {
		return UsersDb.addUser(id, userData);
	},
};
