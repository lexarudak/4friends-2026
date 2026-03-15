const store: Map<string, string[]> = new Map();

export function getUserRooms(userId: string): string[] {
	return store.get(userId) ?? [];
}

export function addUserRoom(userId: string, roomId: string): string[] {
	const rooms = store.get(userId) ?? [];
	const newRooms = new Set([...rooms, roomId]);
	store.set(userId, [...newRooms]);

	console.log(store, [...newRooms]);
	return rooms;
}
