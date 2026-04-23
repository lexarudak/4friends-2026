import type { Bet } from "@/types/api";

// key: "userId:roomId"
const store: Map<string, Bet[]> = new Map();

export function getBets(userId: string, roomId: string): Bet[] {
	return store.get(`${userId}:${roomId}`) ?? [];
}

export function saveBets(userId: string, roomId: string, bets: Bet[]): void {
	store.set(`${userId}:${roomId}`, bets);
}

export function clearBets(userId: string, roomId: string): void {
	store.delete(`${userId}:${roomId}`);
}
