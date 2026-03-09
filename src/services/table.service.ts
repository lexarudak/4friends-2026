export type SmallTable = {
  room_id: string;
  players: string[];
};

export class TableService {
  static async getSmallTable(roomId: string | null): Promise<SmallTable | null> {
    if (!roomId) return null;
    // TODO: replace with real DB lookup; return null if room not found
    return {
      room_id: roomId,
      players: [],
    };
  }
}
