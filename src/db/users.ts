export type DbUser = {
	current_room: string | null;
};

const store: Map<string, DbUser> = new Map();

export function getUserById(id: string): DbUser | null {
	return store.get(id) ?? null;
}

export function addUser(id: string, userData: DbUser): DbUser {
	store.set(id, userData);
	return userData;
}
