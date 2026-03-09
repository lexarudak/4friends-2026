// In-memory store — replace with Prisma or another DB later

export type RoomRecord = {
  room_id: string;
  is_active: boolean;
};

// userId (email) → rooms
const store = new Map<string, RoomRecord[]>();

export function getUserRooms(userId: string): RoomRecord[] {
  return store.get(userId) ?? [];
}

export function setUserRooms(userId: string, rooms: RoomRecord[]): void {
  store.set(userId, rooms);
}
