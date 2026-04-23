import * as BetsDb from "@/db/bets";
import type { Bet } from "@/types/api";

export const BetsService = {
  getBets(userId: string, roomId: string): Bet[] {
    return BetsDb.getBets(userId, roomId);
  },
  saveBets(userId: string, roomId: string, bets: Bet[]): void {
    BetsDb.saveBets(userId, roomId, bets);
  },
  clearBets(userId: string, roomId: string): void {
    BetsDb.clearBets(userId, roomId);
  },
};
